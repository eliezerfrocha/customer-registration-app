# Customer Registration App

Formulário público de cadastro de clientes, com nome completo, CPF, e-mail,
cor preferida (arco-íris) e observações — desenvolvido em Node.js,
TypeScript, React e PostgreSQL.

A especificação completa (requisitos, decisões e premissas assumidas a
partir do relato informal do cliente) está em [`docs/SPEC.md`](docs/SPEC.md).

## Stack

| Camada   | Tecnologias |
|----------|-------------|
| Frontend | React 18, TypeScript, Vite |
| Backend  | Node.js, TypeScript, Express, Zod |
| Banco    | PostgreSQL, Prisma ORM (migrations versionadas) |
| Infra    | Docker + Docker Compose |
| Testes   | Vitest |

## Estrutura do repositório

```
.
├── docs/
│   └── SPEC.md          # Especificação e decisões de projeto
├── server/               # API (Node.js + TypeScript + Prisma)
│   ├── prisma/           # Schema e migrations
│   └── src/
├── web/                  # Frontend (React + TypeScript + Vite)
│   └── src/
└── docker-compose.yml    # Orquestra API + banco + frontend
```

## Rodando com Docker (recomendado)

Pré-requisitos: Docker e Docker Compose.

```bash
cp .env.example .env
docker compose up --build
```

Isso sobe três serviços:

- **db** — PostgreSQL 16, com volume persistente.
- **api** — aplica as migrations automaticamente ao iniciar e expõe a API em `http://localhost:3333`.
- **web** — build estático do frontend servido via Nginx em `http://localhost:5173`.

Depois de subir, popule a lista de cores (uma vez):

```bash
docker compose exec api npm run prisma:seed
```

Acesse `http://localhost:5173` e preencha o formulário.

## Rodando localmente (sem Docker)

Pré-requisitos: Node.js 20+, PostgreSQL rodando localmente.

**Backend**

```bash
cd server
cp .env.example .env   # ajuste DATABASE_URL se necessário
npm install
npm run prisma:migrate:dev
npm run prisma:seed
npm run dev             # http://localhost:3333
```

**Frontend** (em outro terminal)

```bash
cd web
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

## Testes

```bash
cd server
npm test
```

Cobrem a validação de CPF (dígito verificador) e as regras do schema de
cadastro (e-mail, nome, cor, observações).

## API

Documentação interativa (Swagger UI): `http://localhost:3333/docs`
Especificação OpenAPI em JSON: `http://localhost:3333/openapi.json`

| Método | Rota            | Descrição |
|--------|-----------------|-----------|
| GET    | `/health`       | Healthcheck |
| GET    | `/docs`         | Swagger UI |
| GET    | `/api/colors`   | Lista as cores disponíveis para o formulário |
| GET    | `/api/clients`  | Lista os clientes cadastrados (mais recentes primeiro) |
| POST   | `/api/clients`  | Cria um cadastro de cliente |

> **Atenção:** `GET /api/clients` não tem autenticação neste escopo (o teste
> não pediu área administrativa) e expõe dados pessoais (CPF, e-mail). Antes
> de expor essa rota publicamente em produção, adicione autenticação.

## Segurança (formulário público)

Mesmo sem exigir login do cliente final, o `POST /api/clients` tem duas
camadas de proteção contra abuso:

- **Rate limiting** por IP: 5 tentativas de cadastro a cada 15 minutos
  (`GET /api/clients` tem limite mais permissivo, 30/15min). Ao estourar,
  a API responde `429` com `Retry-After` nos headers.
- **Honeypot**: o formulário envia um campo `website`, invisível para
  pessoas reais (escondido via CSS, fora da ordem de tabulação). Bots que
  preenchem tudo automaticamente costumam preencher esse campo também — se
  vier preenchido, a API responde `201` de forma "normal" mas **não grava
  nada no banco**, para não ensinar o bot a evitar o campo.

Nenhuma das duas exige CAPTCHA nem afeta a experiência de quem preenche o
formulário normalmente.

`POST /api/clients` — corpo esperado:

```json
{
  "fullName": "Maria da Silva",
  "cpf": "111.444.777-35",
  "email": "maria@example.com",
  "colorId": "<uuid retornado por GET /api/colors>",
  "notes": "opcional"
}
```

Respostas: `201` (criado), `400` (dados inválidos), `409` (CPF ou e-mail já
cadastrado — um cliente só pode se cadastrar uma vez).

## Decisões técnicas (resumo)

- **Cores como dado, não como constante no front-end**: o próprio cliente
  avisou que a lista de cores pode mudar. Elas ficam em uma tabela
  (`colors`) e são carregadas via API, então adicionar/remover uma cor não
  exige novo deploy do frontend.
- **Unicidade do cadastro por CPF/e-mail**: como o formulário é público e
  sem autenticação, "cadastrar uma única vez" foi implementado como
  restrição de unicidade no banco (CPF e e-mail), retornando `409` em caso
  de duplicidade.
- **Prisma + migrations versionadas**: para que a próxima equipe consiga
  reproduzir o schema do banco em qualquer ambiente com um único comando
  (`prisma migrate deploy`).

Mais detalhes e premissas assumidas em [`docs/SPEC.md`](docs/SPEC.md).

## Próximos passos (fora do escopo deste entregável)

- Painel administrativo para o John Doe consultar os cadastros.
- Autenticação, caso o painel acima seja implementado.
- Confirmação por e-mail do cadastro.
- CI (lint + testes) e pipeline de deploy automatizado.

# Especificação — Cadastro de Clientes (John Doe)

## 1. Contexto

John Doe precisa de um formulário público para coletar dados de clientes do
seu negócio e persisti-los em um banco de dados. O caso de uso foi relatado
de forma informal (transcrição de conversa), então esta seção formaliza os
requisitos extraídos dele antes de qualquer decisão técnica.

## 2. Requisitos funcionais

| ID | Requisito |
|----|-----------|
| RF01 | O sistema deve exibir um formulário público de cadastro de cliente. |
| RF02 | O formulário deve coletar: nome completo, CPF, e-mail, cor preferida e observações. |
| RF03 | A cor preferida deve ser escolhida entre as cores do arco-íris, apresentadas como uma lista carregada do backend (não fixa no front), pois o próprio cliente avisou que a lista pode mudar. |
| RF04 | Observações é um campo de texto livre e opcional. |
| RF05 | Um mesmo cliente deve conseguir se cadastrar apenas uma vez. |
| RF06 | Ao enviar o formulário, o usuário deve receber feedback claro de sucesso ou de falha (e o motivo, quando aplicável). |
| RF07 | Dados inválidos (CPF, e-mail) devem ser rejeitados com mensagem de erro compreensível. |

## 3. Requisitos não funcionais / decisões de projeto

- **Stack obrigatória**: TypeScript, React e Node.js (definida no enunciado do teste).
- **Banco de dados**: PostgreSQL, por indicação do "Jorge" (citado no relato) — decisão do cliente, não questionada aqui.
- **Empacotamento**: a aplicação deve ser conteinerizável (Docker), já que o
  cliente pretende hospedar a "imagem" em um serviço terceirizado.
- **Continuidade**: o cliente pretende dar sequência ao projeto com outra
  equipe futuramente. Por isso: código organizado em camadas, migrations
  versionadas (Prisma), variáveis de ambiente documentadas (`.env.example`)
  e este documento de especificação — para reduzir a curva de entrada de
  quem assumir o projeto depois.

## 4. Decisões de design e premissas assumidas

O relato do cliente é informal e alguns pontos não são 100% explícitos.
Premissas assumidas conscientemente:

1. **"Cadastrar uma única vez"** → interpretado como *unicidade por CPF*
   (identificador único de pessoa física no Brasil). Uma segunda tentativa
   de cadastro com o mesmo CPF é rejeitada com HTTP 409 e mensagem
   explicativa. O e-mail também é único, por ser outro identificador natural
   do cliente e para evitar cadastros duplicados por e-mail divergente de CPF.
   > Não há autenticação de usuário no escopo descrito (é um formulário
   > público, sem menção a login), então "uma única vez" não pode ser
   > garantido por sessão/usuário — a unicidade fica a cargo do CPF.
2. **Cores do arco-íris** → modeladas como uma tabela própria (`Color`) no
   banco, populada via *seed*, e servidas por um endpoint (`GET /api/colors`)
   em vez de uma lista fixa no front-end. Isso atende diretamente ao aviso do
   cliente de que a lista de cores pode mudar no futuro, sem exigir deploy do
   front-end para alterar as opções.
3. **CPF** é validado tanto em formato quanto em dígito verificador
   (algoritmo oficial), para evitar dados inválidos no banco.
4. **Sem autenticação/admin** neste escopo: o teste descreve apenas o
   formulário público de cadastro. Um painel de administração para o John
   Doe consultar os cadastros não foi pedido explicitamente e fica como
   próximo passo natural (ver `README.md`, seção "Próximos passos").
   Foi adicionado apenas o endpoint `GET /api/clients` (listagem crua, sem
   interface) para permitir consulta dos cadastros — como ainda não há
   autenticação, essa rota expõe dados pessoais (CPF, e-mail) sem proteção
   e não deve ser exposta publicamente em produção sem antes adicionar
   autenticação.
5. **Hospedagem**: o Docker Compose incluso sobe API + banco + frontend
   localmente e serve de base para deploy em qualquer serviço de contêineres
   (Railway, Render, Fly.io, ECS, etc.). O provisionamento de um serviço
   terceirizado específico não faz parte deste entregável.

## 5. Modelo de dados (visão geral)

```
Color
- id
- name        (ex: "Vermelho")
- hex_code     (ex: "#FF0000")
- sort_order   (posição no arco-íris)

Client
- id
- full_name
- cpf          (único, armazenado apenas com dígitos)
- email        (único)
- color_id     (FK -> Color)
- notes        (opcional)
- created_at
```

## 6. API (contrato)

- `GET /api/colors` → lista de cores disponíveis para o `<select>` do formulário.
- `POST /api/clients` → cria um cadastro de cliente.
  - `201 Created` + dados do cliente criado.
  - `400 Bad Request` → payload inválido (CPF/e-mail malformado, campos obrigatórios ausentes).
  - `409 Conflict` → CPF ou e-mail já cadastrado.
- `GET /health` → healthcheck (uso operacional/infra).

## 7. Fora de escopo (explicitamente)

- Autenticação e área administrativa.
- Edição/exclusão de cadastros.
- Envio de e-mail de confirmação.
- Provisionamento efetivo do serviço de hospedagem terceirizado.

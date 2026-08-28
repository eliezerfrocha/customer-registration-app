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
| RF03 | A cor preferida deve ser escolhida entre as cores do arco-íris, apresentadas como uma lista carregada do backend (não fixa no front), pois o cliente avisou que a lista pode mudar. |
| RF04 | Observações é um campo de texto livre e opcional. |
| RF05 | Um mesmo cliente deve conseguir se cadastrar apenas uma vez. |
| RF06 | Ao enviar o formulário, o usuário deve receber feedback claro de sucesso ou de falha (e o motivo, quando aplicável). |
| RF07 | Dados inválidos (CPF, e-mail) devem ser rejeitados com mensagem de erro compreensível. |

## 3. Requisitos não funcionais

- **Stack obrigatória**: TypeScript, React e Node.js (definida no enunciado do teste).
- **Banco de dados**: PostgreSQL, por indicação do "Jorge" citado no relato.
- **Empacotamento**: a aplicação precisa ser conteinerizável, já que o cliente
  pretende hospedar a "imagem" em um serviço terceirizado.
- **Continuidade**: o cliente pretende dar sequência ao projeto com outra
  equipe. Por isso a organização em camadas, as migrations versionadas e este
  documento existem — para reduzir a curva de entrada de quem assumir o
  projeto depois.

## 4. Premissas assumidas

O relato do cliente é informal e alguns pontos não são 100% explícitos. Estas
foram as interpretações adotadas:

1. **"Cadastrar uma única vez"** foi implementado como unicidade de CPF e
   e-mail no banco — não existe autenticação/sessão no escopo descrito (é um
   formulário público, sem menção a login), então a unicidade só pode ser
   garantida pelo próprio dado. Uma segunda tentativa com o mesmo CPF ou
   e-mail é rejeitada com `409`.
2. **Cores do arco-íris** viraram uma tabela (`colors`) populada por seed e
   servida via `GET /api/colors`, em vez de uma lista fixa no frontend —
   atende diretamente ao aviso do cliente de que a lista pode mudar, sem
   exigir novo deploy do front para isso.
3. **CPF** é validado pelo dígito verificador oficial, não só pelo formato.
4. **Sem autenticação/admin** neste escopo — o teste descreve apenas o
   formulário público. Foi adicionado um endpoint de listagem crua
   (`GET /api/clients`, sem interface) para permitir consulta dos cadastros;
   como ainda não há autenticação, essa rota expõe CPF e e-mail e não deve
   ficar pública em produção sem adicionar autenticação antes.
5. **Anti-abuso sem exigir login**: rate limiting por IP e um honeypot no
   `POST /api/clients` reduzem spam de bot no formulário público sem
   introduzir fricção (CAPTCHA, cadastro de usuário) para quem preenche de
   verdade. Detalhes no README.
6. **Hospedagem**: o Docker Compose incluso sobe API + banco + frontend
   localmente e serve de base para deploy em qualquer serviço de contêineres.
   O provisionamento de um serviço terceirizado específico não fazia parte
   deste entregável originalmente — o deploy efetivo está documentado no
   README quando existir.

## 5. Modelo de dados

```
colors
- id          uuid, pk
- name        text, único        (ex.: "Vermelho")
- hex_code    text                (ex.: "#E53935")
- sort_order  int                 posição no arco-íris

clients
- id          uuid, pk
- full_name   text
- cpf         text, único         (somente dígitos)
- email       text, único
- color_id    uuid, fk -> colors
- notes       text, opcional
- created_at  timestamp
```

O contrato completo da API (rotas, payloads, códigos de erro) vive na
especificação OpenAPI servida pela própria aplicação em `/docs` — é a fonte
da verdade porque é gerada a partir do código, então não pode ficar
desatualizada em relação a ele. Ver README para como rodar o projeto.

## 6. Fora de escopo

- Autenticação e área administrativa.
- Edição/exclusão de cadastros.
- Envio de e-mail de confirmação.

const API_DESCRIPTION = `
API de cadastro de clientes: recebe nome completo, CPF, e-mail, cor preferida
(entre as cores de um arco-íris configurável) e observações, validando os
dados e persistindo em PostgreSQL.

### Fluxo típico
1. \`GET /api/colors\` — carregar as cores disponíveis para preencher o seletor do formulário.
2. \`POST /api/clients\` — enviar o cadastro. Um mesmo CPF ou e-mail só pode se cadastrar uma vez.

### Autenticação
Nenhum endpoint desta versão exige autenticação — é um formulário público de
cadastro. **Isso inclui \`GET /api/clients\`**, que lista os cadastros
completos (CPF e e-mail inclusos). Antes de expor essa rota em produção,
adicione um mecanismo de autenticação/autorização.

### Formato de erro
Toda resposta de erro segue o schema [\`ErrorResponse\`](#/components/schemas/ErrorResponse):
um \`message\` legível e, para erros de validação (\`400\`), uma lista
\`issues\` com o campo e o motivo específico de cada falha.
`.trim();

const CPF_DESCRIPTION =
  "CPF do cliente, com ou sem máscara (aceita `111.444.777-35` ou `11144477735`). " +
  "É validado pelo dígito verificador oficial, não apenas pelo formato, e armazenado somente com dígitos.";

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Customer Registration API",
    description: API_DESCRIPTION,
    version: "1.0.0",
    license: {
      name: "MIT",
      url: "https://github.com/eliezerfrocha/customer-registration-app/blob/main/LICENSE",
    },
  },
  externalDocs: {
    description: "Repositório, especificação e instruções de setup",
    url: "https://github.com/eliezerfrocha/customer-registration-app",
  },
  servers: [{ url: "/", description: "Mesma origem do host atual (local ou produção)" }],
  tags: [
    { name: "Health", description: "Status operacional da API" },
    { name: "Colors", description: "Cores disponíveis para o formulário de cadastro" },
    { name: "Clients", description: "Cadastro e consulta de clientes" },
  ],
  paths: {
    "/health": {
      get: {
        operationId: "healthCheck",
        tags: ["Health"],
        summary: "Verifica se a API está no ar",
        security: [],
        responses: {
          "200": {
            description: "API operacional.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthStatus" },
                examples: { ok: { value: { status: "ok" } } },
              },
            },
          },
        },
      },
    },
    "/api/colors": {
      get: {
        operationId: "listColors",
        tags: ["Colors"],
        summary: "Lista as cores disponíveis",
        description:
          "Retorna as cores do arco-íris cadastradas no banco (via seed), ordenadas por " +
          "`sortOrder`. A lista é dinâmica de propósito: adicionar ou remover uma cor não " +
          "exige alterar ou reimplantar o frontend.",
        security: [],
        responses: {
          "200": {
            description: "Lista de cores ordenada.",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Color" } },
                examples: { rainbow: { $ref: "#/components/examples/ColorListExample" } },
              },
            },
          },
        },
      },
    },
    "/api/clients": {
      get: {
        operationId: "listClients",
        tags: ["Clients"],
        summary: "Lista os clientes cadastrados",
        description:
          "Retorna todos os cadastros, mais recentes primeiro. **Sem autenticação nesta " +
          "versão** — veja a nota em Autenticação, no topo desta documentação.",
        security: [],
        responses: {
          "200": {
            description: "Lista de clientes cadastrados (pode ser vazia).",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Client" } },
                examples: {
                  withResults: { $ref: "#/components/examples/ClientListExample" },
                  empty: { summary: "Nenhum cadastro ainda", value: [] },
                },
              },
            },
          },
        },
      },
      post: {
        operationId: "createClient",
        tags: ["Clients"],
        summary: "Cadastra um cliente",
        description:
          "Cria um novo cadastro. CPF e e-mail são únicos: enviar um valor já cadastrado " +
          "resulta em `409 Conflict` — é assim que se garante que cada cliente só se " +
          "cadastra uma vez. Limitado a 5 requisições por IP a cada 15 minutos " +
          "(`429 Too Many Requests` ao exceder).",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateClientInput" },
              examples: { valid: { $ref: "#/components/examples/CreateClientRequestExample" } },
            },
          },
        },
        responses: {
          "201": {
            description: "Cliente cadastrado com sucesso.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Client" },
                examples: { created: { $ref: "#/components/examples/ClientExample" } },
              },
            },
          },
          "400": {
            description: "Dados inválidos: CPF/e-mail malformado, cor inexistente ou campo obrigatório ausente.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                examples: { invalidCpf: { $ref: "#/components/examples/ValidationErrorExample" } },
              },
            },
          },
          "409": {
            description: "CPF ou e-mail já cadastrado anteriormente.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                examples: { duplicateCpf: { $ref: "#/components/examples/ConflictErrorExample" } },
              },
            },
          },
          "429": {
            description: "Limite de 5 requisições a cada 15 minutos por IP excedido.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                examples: { rateLimited: { $ref: "#/components/examples/RateLimitedErrorExample" } },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      HealthStatus: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["ok"] },
        },
      },
      Color: {
        type: "object",
        description: "Uma cor disponível para seleção no formulário de cadastro.",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          hexCode: { type: "string", description: "Código hexadecimal da cor, no formato #RRGGBB." },
          sortOrder: {
            type: "integer",
            description: "Posição de exibição da cor (ordem do arco-íris).",
          },
        },
      },
      CreateClientInput: {
        type: "object",
        required: ["fullName", "cpf", "email", "colorId"],
        properties: {
          fullName: {
            type: "string",
            minLength: 3,
            maxLength: 150,
            description: "Nome completo do cliente.",
          },
          cpf: { type: "string", description: CPF_DESCRIPTION },
          email: {
            type: "string",
            format: "email",
            description: "Normalizado para minúsculas antes de salvar.",
          },
          colorId: {
            type: "string",
            format: "uuid",
            description: "Um dos `id` retornados por `GET /api/colors`.",
          },
          notes: {
            type: "string",
            maxLength: 1000,
            nullable: true,
            description: "Observações livres. Campo opcional.",
          },
        },
      },
      Client: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          fullName: { type: "string" },
          cpf: {
            type: "string",
            description: "Armazenado somente com dígitos (sem máscara).",
          },
          email: { type: "string" },
          notes: { type: "string", nullable: true },
          colorId: { type: "string", format: "uuid" },
          color: { $ref: "#/components/schemas/Color" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      ValidationIssue: {
        type: "object",
        description: "Um campo específico que falhou na validação.",
        properties: {
          path: { type: "string", description: "Nome do campo com problema." },
          message: { type: "string" },
        },
      },
      ErrorResponse: {
        type: "object",
        required: ["message"],
        properties: {
          message: { type: "string" },
          issues: {
            type: "array",
            description: "Presente apenas em erros de validação (400), um item por campo inválido.",
            items: { $ref: "#/components/schemas/ValidationIssue" },
          },
        },
      },
    },
    examples: {
      ColorListExample: {
        summary: "As 7 cores do arco-íris",
        value: [
          { id: "b0c9cdf2-42b4-48dd-9539-76b53368b1e4", name: "Vermelho", hexCode: "#E53935", sortOrder: 1 },
          { id: "1e11b53d-9d58-4c95-b6d4-f7065ffedbae", name: "Laranja", hexCode: "#FB8C00", sortOrder: 2 },
          { id: "5caf757d-7143-42f6-a34d-e508d260f875", name: "Amarelo", hexCode: "#FDD835", sortOrder: 3 },
        ],
      },
      CreateClientRequestExample: {
        summary: "Cadastro válido",
        value: {
          fullName: "Maria da Silva",
          cpf: "111.444.777-35",
          email: "maria@example.com",
          colorId: "b0c9cdf2-42b4-48dd-9539-76b53368b1e4",
          notes: "Cliente preferencial",
        },
      },
      ClientExample: {
        summary: "Cliente cadastrado",
        value: {
          id: "7bdc2809-8f04-4966-a22b-57926ce2f4ad",
          fullName: "Maria da Silva",
          cpf: "11144477735",
          email: "maria@example.com",
          notes: "Cliente preferencial",
          colorId: "b0c9cdf2-42b4-48dd-9539-76b53368b1e4",
          createdAt: "2026-08-27T17:08:46.672Z",
          color: { id: "b0c9cdf2-42b4-48dd-9539-76b53368b1e4", name: "Vermelho", hexCode: "#E53935", sortOrder: 1 },
        },
      },
      ClientListExample: {
        summary: "Dois cadastros, mais recente primeiro",
        value: [
          {
            id: "18ada08e-0aa8-4e56-8c71-0fc0d213fbdf",
            fullName: "Kevin Banks",
            cpf: "50823724085",
            email: "kevin.banks@email.com",
            notes: "Teste",
            colorId: "1e11b53d-9d58-4c95-b6d4-f7065ffedbae",
            createdAt: "2026-08-28T12:47:00.865Z",
            color: { id: "1e11b53d-9d58-4c95-b6d4-f7065ffedbae", name: "Laranja", hexCode: "#FB8C00", sortOrder: 2 },
          },
          {
            id: "7bdc2809-8f04-4966-a22b-57926ce2f4ad",
            fullName: "Maria da Silva",
            cpf: "11144477735",
            email: "maria@example.com",
            notes: "Cliente preferencial",
            colorId: "b0c9cdf2-42b4-48dd-9539-76b53368b1e4",
            createdAt: "2026-08-27T17:08:46.672Z",
            color: { id: "b0c9cdf2-42b4-48dd-9539-76b53368b1e4", name: "Vermelho", hexCode: "#E53935", sortOrder: 1 },
          },
        ],
      },
      ValidationErrorExample: {
        summary: "CPF inválido",
        value: {
          message: "Dados inválidos.",
          issues: [{ path: "cpf", message: "CPF inválido." }],
        },
      },
      ConflictErrorExample: {
        summary: "CPF já cadastrado",
        value: { message: "Já existe um cadastro com esse CPF." },
      },
      RateLimitedErrorExample: {
        summary: "Limite de requisições excedido",
        value: { message: "Muitas tentativas de cadastro. Tente novamente em alguns minutos." },
      },
    },
  },
} as const;

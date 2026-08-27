export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Customer Registration API",
    description: "API de cadastro de clientes (nome completo, CPF, e-mail, cor preferida e observações).",
    version: "1.0.0",
  },
  servers: [{ url: "/", description: "Servidor atual" }],
  tags: [
    { name: "Health", description: "Healthcheck" },
    { name: "Colors", description: "Cores disponíveis para o formulário" },
    { name: "Clients", description: "Cadastro de clientes" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Healthcheck da API",
        responses: {
          "200": {
            description: "API operacional",
            content: {
              "application/json": {
                schema: { type: "object", properties: { status: { type: "string", example: "ok" } } },
              },
            },
          },
        },
      },
    },
    "/api/colors": {
      get: {
        tags: ["Colors"],
        summary: "Lista as cores disponíveis (arco-íris)",
        responses: {
          "200": {
            description: "Lista de cores ordenada",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Color" } },
              },
            },
          },
        },
      },
    },
    "/api/clients": {
      post: {
        tags: ["Clients"],
        summary: "Cadastra um cliente",
        description: "Um cliente só pode se cadastrar uma vez: CPF e e-mail são únicos.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateClientInput" },
              example: {
                fullName: "Maria da Silva",
                cpf: "111.444.777-35",
                email: "maria@example.com",
                colorId: "00000000-0000-0000-0000-000000000000",
                notes: "Cliente preferencial",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Cliente cadastrado com sucesso",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Client" } } },
          },
          "400": {
            description: "Dados inválidos (CPF, e-mail, cor ou campos obrigatórios)",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
          "409": {
            description: "CPF ou e-mail já cadastrado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Color: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Vermelho" },
          hexCode: { type: "string", example: "#E53935" },
          sortOrder: { type: "integer", example: 1 },
        },
      },
      CreateClientInput: {
        type: "object",
        required: ["fullName", "cpf", "email", "colorId"],
        properties: {
          fullName: { type: "string", minLength: 3, maxLength: 150 },
          cpf: { type: "string", description: "Com ou sem formatação; validado com dígito verificador." },
          email: { type: "string", format: "email" },
          colorId: { type: "string", format: "uuid" },
          notes: { type: "string", maxLength: 1000, nullable: true },
        },
      },
      Client: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          fullName: { type: "string" },
          cpf: { type: "string" },
          email: { type: "string" },
          notes: { type: "string", nullable: true },
          colorId: { type: "string", format: "uuid" },
          color: { $ref: "#/components/schemas/Color" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          issues: {
            type: "array",
            items: {
              type: "object",
              properties: { path: { type: "string" }, message: { type: "string" } },
            },
          },
        },
      },
    },
  },
} as const;

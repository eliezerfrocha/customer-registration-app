import { z } from "zod";
import { isValidCpf } from "../utils/cpf";

export const createClientSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Informe o nome completo.")
    .max(150, "Nome muito longo."),
  cpf: z
    .string()
    .trim()
    .refine(isValidCpf, { message: "CPF inválido." }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("E-mail inválido."),
  colorId: z.string().uuid("Selecione uma cor válida."),
  notes: z.string().trim().max(1000, "Observações muito longas.").optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;

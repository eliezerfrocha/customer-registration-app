import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middlewares/errorHandler";
import { onlyDigits } from "../utils/cpf";
import { CreateClientInput } from "../validators/clientSchema";

export async function listClients() {
  return prisma.client.findMany({
    include: { color: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createClient(input: CreateClientInput) {
  const cpf = onlyDigits(input.cpf);

  const color = await prisma.color.findUnique({ where: { id: input.colorId } });
  if (!color) {
    throw new HttpError(400, "Cor selecionada não existe.");
  }

  try {
    return await prisma.client.create({
      data: {
        fullName: input.fullName,
        cpf,
        email: input.email,
        colorId: input.colorId,
        notes: input.notes,
      },
      include: { color: true },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = (error.meta?.target as string[] | undefined)?.join(", ");
      const field = target?.includes("cpf") ? "CPF" : "e-mail";
      throw new HttpError(409, `Já existe um cadastro com esse ${field}.`);
    }
    throw error;
  }
}

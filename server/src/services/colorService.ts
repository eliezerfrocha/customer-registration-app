import { prisma } from "../lib/prisma";

export async function listColors() {
  return prisma.color.findMany({ orderBy: { sortOrder: "asc" } });
}

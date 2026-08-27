import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const RAINBOW_COLORS = [
  { name: "Vermelho", hexCode: "#E53935", sortOrder: 1 },
  { name: "Laranja", hexCode: "#FB8C00", sortOrder: 2 },
  { name: "Amarelo", hexCode: "#FDD835", sortOrder: 3 },
  { name: "Verde", hexCode: "#43A047", sortOrder: 4 },
  { name: "Azul", hexCode: "#1E88E5", sortOrder: 5 },
  { name: "Anil", hexCode: "#3949AB", sortOrder: 6 },
  { name: "Violeta", hexCode: "#8E24AA", sortOrder: 7 },
];

async function main() {
  for (const color of RAINBOW_COLORS) {
    await prisma.color.upsert({
      where: { name: color.name },
      update: { hexCode: color.hexCode, sortOrder: color.sortOrder },
      create: color,
    });
  }
  console.log(`Seed concluído: ${RAINBOW_COLORS.length} cores.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

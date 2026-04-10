import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // For each user, set their earliest-created list as default
  // if none already has isDefault = true.
  // Uses raw SQL to avoid stale Prisma client issues.
  await prisma.$executeRawUnsafe(`
    UPDATE "List" l
    SET    "isDefault" = true
    WHERE  l.id = (
      SELECT id FROM "List"
      WHERE  "userId" = l."userId"
      ORDER  BY "createdAt" ASC
      LIMIT  1
    )
    AND NOT EXISTS (
      SELECT 1 FROM "List"
      WHERE  "userId" = l."userId"
      AND    "isDefault" = true
    )
  `);

  const updated = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*) as count FROM "List" WHERE "isDefault" = true`
  );
  console.log(`Migration complete. Lists with isDefault=true: ${updated[0].count}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

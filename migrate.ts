import prisma from './src/lib/prisma.ts';

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "DailyLog" (
        "id" TEXT NOT NULL,
        "date" TIMESTAMP(3) NOT NULL,
        "abstinence" INTEGER NOT NULL,
        "sleep" DOUBLE PRECISION NOT NULL,
        "reflection" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "DailyLog_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "DailyLog_date_key" ON "DailyLog"("date");
  `);

  console.log("Migration complete.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });

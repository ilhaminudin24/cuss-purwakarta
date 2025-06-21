import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? [] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      },
    },
  }).$extends({
    query: {
      $allOperations({ operation, model, args, query }) {
        const start = Date.now();
        return query(args).finally(() => {
          const end = Date.now();
          if (end - start > 1000) {
            console.warn(`Slow query detected (${end - start}ms):`, {
              model,
              operation,
              args,
            });
          }
        });
      },
    },
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const initPrismaClient = () => {
  const client = globalForPrisma.prisma ?? prismaClientSingleton();
  
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  
  return client;
};

export const prisma = initPrismaClient();

process.on('beforeExit', async () => {
  await prisma.$disconnect();
}); 
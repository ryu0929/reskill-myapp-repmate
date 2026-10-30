import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// 開発中の再読み込みで接続が増えないよう、Prisma Clientを再利用する。
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

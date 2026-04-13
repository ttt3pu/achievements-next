import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

let prismaClient: PrismaClient;

export function createPrismaClient(): PrismaClient {
  if (prismaClient === undefined) {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    prismaClient = new PrismaClient({ adapter });
    return prismaClient;
  }

  return prismaClient;
}

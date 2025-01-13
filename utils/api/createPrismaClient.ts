import { PrismaClient } from '@prisma/client';

let prismaClient: PrismaClient;

export function createPrismaClient(): PrismaClient {
  if (prismaClient === undefined) {
    prismaClient = new PrismaClient();
    return prismaClient;
  }

  return prismaClient;
}

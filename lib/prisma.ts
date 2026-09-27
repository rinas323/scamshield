// Singleton Prisma client for MongoDB Atlas / local MongoDB.
// Prisma 6 reads DATABASE_URL from the env automatically (loaded by Next.js).
import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

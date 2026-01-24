/**
 * Prisma Client Singleton
 * 
 * This module provides a single, reusable Prisma Client instance for all server-side
 * database operations. In development, it uses global caching to prevent creating
 * multiple instances during hot reloads.
 * 
 * Usage:
 *   import { prisma } from '@/lib/db';
 *   const users = await prisma.user.findMany();
 */

import { PrismaClient } from '@prisma/client';

// Extend NodeJS global to include prisma for dev caching
declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Create a new PrismaClient instance with optional logging
 */
const createPrismaClient = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

/**
 * Singleton Prisma Client instance
 * 
 * In development: uses global cache to survive hot-reloads
 * In production: creates a single instance
 */
export const prisma = global.prisma ?? createPrismaClient();

// Cache the instance globally in development to prevent multiple connections
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * Helper function to safely disconnect Prisma (useful in tests or serverless cleanup)
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

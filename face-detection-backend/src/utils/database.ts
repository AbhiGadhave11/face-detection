import { PrismaClient } from "@prisma/client";


declare global {
    // prevent multiple instances of PrismaClient in development
    var __prisma: PrismaClient | undefined
}

export const prisma = global.__prisma || new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

// In development, save the instance globally to prevent reconnections
if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export async function disconnectDatabase(): Promise<void> {
    await prisma.$disconnect();
    console.log('Database connection closed.');
}

export async function testDatabaseConnection(): Promise<boolean> {
    try {
        await prisma.$queryRaw`SELECT 1`;
        console.log('Database connection successful.');
        return true;
    } catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }

}
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query test successful:', result);
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.error('Make sure PostgreSQL is running and DATABASE_URL is correct');
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
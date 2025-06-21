const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function setupDevDatabase() {
  console.log('🚀 Setting up Development Database...');
  
  // Load environment variables from .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
  } else {
    console.error('❌ .env.local file not found! Please create it first.');
    console.log('📝 Create a .env.local file with your development DATABASE_URL');
    console.log('Example:');
    console.log('DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/cuss-purwakarta-dev?retryWrites=true&w=majority"');
    console.log('NEXTAUTH_URL="http://localhost:3000"');
    console.log('NEXTAUTH_SECRET="your-development-secret-key-here"');
    console.log('NODE_ENV="development"');
    process.exit(1);
  }
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env.local!');
    process.exit(1);
  }
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    log: ['query', 'info', 'warn', 'error']
  });
  
  try {
    console.log('📊 Testing database connection...');
    
    // Test the connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    console.log('📋 Next steps:');
    console.log('   1. Run: npm run db:push:dev');
    console.log('   2. Run: npm run db:seed:dev');
    console.log('   3. Run: npm run dev');
    
  } catch (error) {
    console.error('❌ Error connecting to database:', error.message);
    console.log('💡 Make sure:');
    console.log('   - Your MongoDB Atlas cluster is running');
    console.log('   - Your IP address is whitelisted in MongoDB Atlas');
    console.log('   - Your connection string is correct');
    console.log('   - Your username and password are correct');
  } finally {
    await prisma.$disconnect();
  }
}

setupDevDatabase(); 
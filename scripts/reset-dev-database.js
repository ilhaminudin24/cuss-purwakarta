const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function resetDevDatabase() {
  console.log('🔄 Resetting Development Database...');
  
  // Load environment variables
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
  } else {
    console.error('❌ .env.local file not found! Please create it first.');
    process.exit(1);
  }
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env.local!');
    process.exit(1);
  }
  
  try {
    // Force reset the database
    console.log('🗑️  Dropping all collections...');
    execSync('npx prisma db push --force-reset', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
    });
    
    // Seed the database
    console.log('🌱 Seeding database...');
    execSync('node seed-booking-form-fields.js', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
    });
    
    console.log('✅ Development database reset completed!');
    console.log('🚀 You can now run: npm run dev');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
  }
}

resetDevDatabase(); 
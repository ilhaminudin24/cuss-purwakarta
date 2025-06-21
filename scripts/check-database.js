const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function checkDatabase() {
  console.log('🔍 Checking Database Connection...');
  console.log('================================\n');
  
  // Load environment variables
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
  } else {
    console.log('⚠️  .env.local file not found');
  }
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Not set'}`);
  
  if (process.env.DATABASE_URL) {
    // Extract database name from connection string
    const dbName = process.env.DATABASE_URL.match(/\/\/([^?]+)\?/)?.[1]?.split('/')?.[1] || 'unknown';
    console.log(`   Database Name: ${dbName}`);
    
    // Check if it's development database
    if (dbName.includes('dev') || dbName.includes('development')) {
      console.log('   ✅ This appears to be a development database');
    } else {
      console.log('   ⚠️  This might be a production database');
    }
  }
  
  console.log('\n🔄 Testing Database Connection...');
  
  try {
    const prisma = new PrismaClient({
      log: ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Get database info
    console.log('\n📊 Database Information:');
    
    // Count records in each collection
    const collections = [
      'user', 'service', 'fAQ', 'navigationMenu', 'bookingFormField', 
      'serviceConfig', 'bookingService', 'transaction', 'page', 
      'testimonial', 'howToOrder'
    ];
    
    for (const collection of collections) {
      try {
        const count = await prisma[collection].count();
        console.log(`   ${collection}: ${count} records`);
      } catch (error) {
        console.log(`   ${collection}: ❌ Error or collection doesn't exist`);
      }
    }
    
    // Check if this is a fresh development database
    const totalRecords = await Promise.all(
      collections.map(async (collection) => {
        try {
          return await prisma[collection].count();
        } catch {
          return 0;
        }
      })
    );
    
    const totalCount = totalRecords.reduce((sum, count) => sum + count, 0);
    
    console.log(`\n📈 Total Records: ${totalCount}`);
    
    if (totalCount === 0) {
      console.log('🆕 This appears to be a fresh/empty database');
    } else if (totalCount < 50) {
      console.log('🌱 This appears to be a development database with minimal data');
    } else {
      console.log('📦 This appears to be a database with substantial data');
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.log('❌ Database connection failed!');
    console.log(`   Error: ${error.message}`);
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Check your .env.local file');
    console.log('   2. Verify MongoDB Atlas connection string');
    console.log('   3. Ensure your IP is whitelisted in MongoDB Atlas');
    console.log('   4. Check if your MongoDB cluster is running');
  }
  
  console.log('\n🔍 Additional Checks:');
  console.log('   1. Run: npm run db:studio:dev (to view database in browser)');
  console.log('   2. Check your .env.local file for correct DATABASE_URL');
  console.log('   3. Verify NODE_ENV is set to "development"');
}

checkDatabase(); 
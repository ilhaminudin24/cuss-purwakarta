const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function pushToProduction() {
  console.log('🚀 Pushing Schema Changes to Production Database...');
  console.log('==================================================\n');
  
  // Load environment variables
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
  } else {
    console.error('❌ .env.local file not found!');
    process.exit(1);
  }
  
  if (!process.env.DATABASE_URL_PROD) {
    console.error('❌ DATABASE_URL_PROD not found in .env.local!');
    console.log('\n📝 Please add your production database URL to .env.local:');
    console.log('DATABASE_URL_PROD="mongodb+srv://username:password@cluster.mongodb.net/cuss-purwakarta?retryWrites=true&w=majority"');
    process.exit(1);
  }
  
  console.log('📋 Environment Check:');
  console.log(`   Development DB: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Not set'}`);
  console.log(`   Production DB: ${process.env.DATABASE_URL_PROD ? '✅ Set' : '❌ Not set'}`);
  
  // Extract database names
  const devDbName = process.env.DATABASE_URL?.match(/\/\/([^?]+)\?/)?.[1]?.split('/')?.[1] || 'unknown';
  const prodDbName = process.env.DATABASE_URL_PROD?.match(/\/\/([^?]+)\?/)?.[1]?.split('/')?.[1] || 'unknown';
  
  console.log(`   Development Database: ${devDbName}`);
  console.log(`   Production Database: ${prodDbName}`);
  
  if (devDbName === prodDbName) {
    console.error('❌ Error: Development and Production databases are the same!');
    console.log('   This could cause data loss. Please check your DATABASE_URL_PROD.');
    process.exit(1);
  }
  
  console.log('\n⚠️  WARNING: This will modify your PRODUCTION database!');
  console.log('   Make sure you have a backup before proceeding.');
  
  // Ask for confirmation
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const answer = await new Promise((resolve) => {
    rl.question('\nDo you want to continue? (yes/no): ', resolve);
  });
  rl.close();
  
  if (answer.toLowerCase() !== 'yes') {
    console.log('❌ Migration cancelled.');
    process.exit(0);
  }
  
  console.log('\n🔄 Connecting to production database...');
  
  const prodPrisma = new PrismaClient({
    datasources: { 
      db: { 
        url: process.env.DATABASE_URL_PROD 
      } 
    }
  });
  
  try {
    // Test connection
    await prodPrisma.$connect();
    console.log('✅ Connected to production database');
    
    // Check current schema
    console.log('\n📊 Checking current production schema...');
    
    // Try to access the new fields
    try {
      const sampleTransaction = await prodPrisma.transaction.findFirst({
        select: {
          id: true,
          latitude: true,
          longitude: true
        }
      });
      console.log('✅ GPS fields (latitude, longitude) are already available in production');
      console.log('   Schema is up to date!');
    } catch (error) {
      if (error.message.includes('Unknown field')) {
        console.log('❌ GPS fields not found in production schema');
        console.log('🔄 Pushing schema changes...');
        
        // Use Prisma db push for MongoDB
        const { execSync } = require('child_process');
        const originalUrl = process.env.DATABASE_URL;
        process.env.DATABASE_URL = process.env.DATABASE_URL_PROD;
        
        try {
          execSync('npx prisma db push', { 
            stdio: 'inherit',
            env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL_PROD }
          });
          console.log('✅ Schema changes pushed to production successfully!');
        } catch (pushError) {
          console.error('❌ Failed to push schema changes:', pushError.message);
          throw pushError;
        } finally {
          process.env.DATABASE_URL = originalUrl;
        }
      } else {
        throw error;
      }
    }
    
    // Verify the changes
    console.log('\n🔍 Verifying changes...');
    const verifyTransaction = await prodPrisma.transaction.findFirst({
      select: {
        id: true,
        latitude: true,
        longitude: true
      }
    });
    
    if (verifyTransaction) {
      console.log('✅ Verification successful! GPS fields are now available in production');
      console.log(`   Sample transaction ID: ${verifyTransaction.id}`);
      console.log(`   Latitude field: ${verifyTransaction.latitude !== undefined ? 'Available' : 'Not set'}`);
      console.log(`   Longitude field: ${verifyTransaction.longitude !== undefined ? 'Available' : 'Not set'}`);
    }
    
    console.log('\n🎉 Production database migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Deploy your application to production');
    console.log('   2. Test the GPS feature in production');
    console.log('   3. Monitor for any issues');
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check your DATABASE_URL_PROD is correct');
    console.log('   2. Ensure your IP is whitelisted in MongoDB Atlas');
    console.log('   3. Verify your MongoDB cluster is running');
    console.log('   4. Check if you have write permissions to the production database');
  } finally {
    await prodPrisma.$disconnect();
  }
}

pushToProduction(); 
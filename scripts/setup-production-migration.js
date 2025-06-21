const fs = require('fs');
const path = require('path');

function setupProductionMigration() {
  console.log('🔧 Setting up Production Database Migration...');
  console.log('==============================================\n');
  
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local file not found!');
    process.exit(1);
  }
  
  // Read current .env.local
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  console.log('📋 Current .env.local configuration:');
  console.log('   DATABASE_URL: Development database (cuss-purwakarta-dev)');
  
  // Check if DATABASE_URL_PROD already exists
  if (envContent.includes('DATABASE_URL_PROD=')) {
    console.log('✅ DATABASE_URL_PROD already exists in .env.local');
    console.log('\n🎉 You can now run the migration:');
    console.log('   npm run db:migrate:dev');
  } else {
    console.log('\n❌ DATABASE_URL_PROD not found in .env.local');
    console.log('\n📝 To copy data from production to development:');
    console.log('   1. Add this line to your .env.local file:');
    console.log('   DATABASE_URL_PROD="mongodb+srv://ilhmndn:nJ9RnNBrwGGNsR8A@cuss-purwakarta.dzubmil.mongodb.net/cuss-purwakarta?retryWrites=true&w=majority&appName=Cuss-purwakarta"');
    console.log('\n   2. Then run: npm run db:migrate:dev');
    
    console.log('\n⚠️  Important:');
    console.log('   - This will copy ALL data from production to development');
    console.log('   - Your development database will be overwritten');
    console.log('   - Make sure you want to do this!');
    
    console.log('\n💡 Alternative approach:');
    console.log('   If you want to start fresh instead, run:');
    console.log('   npm run db:seed:dev');
  }
}

setupProductionMigration(); 
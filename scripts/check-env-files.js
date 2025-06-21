const fs = require('fs');
const path = require('path');

function checkEnvFiles() {
  console.log('🔍 Checking Environment Files...');
  console.log('================================\n');
  
  const envFiles = [
    '.env',
    '.env.local',
    '.env.development',
    '.env.development.local',
    '.env.production',
    '.env.production.local'
  ];
  
  console.log('📋 Checking for environment files:');
  
  for (const envFile of envFiles) {
    const envPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      console.log(`✅ ${envFile} - EXISTS`);
      
      // Read and check DATABASE_URL
      const content = fs.readFileSync(envPath, 'utf8');
      const databaseUrlMatch = content.match(/DATABASE_URL="([^"]+)"/);
      
      if (databaseUrlMatch) {
        const databaseUrl = databaseUrlMatch[1];
        const dbNameMatch = databaseUrl.match(/\/\/([^?]+)\?/);
        if (dbNameMatch) {
          const dbName = dbNameMatch[1].split('/')[1];
          console.log(`   📊 DATABASE_URL: ${dbName}`);
          console.log(`   🔗 URL: ${databaseUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
        }
      } else {
        console.log(`   ❌ No DATABASE_URL found`);
      }
    } else {
      console.log(`❌ ${envFile} - NOT FOUND`);
    }
  }
  
  console.log('\n🔍 Environment Variable Priority:');
  console.log('   Next.js loads environment files in this order:');
  console.log('   1. .env.local (highest priority)');
  console.log('   2. .env.development.local');
  console.log('   3. .env.development');
  console.log('   4. .env');
  console.log('   5. .env.production.local');
  console.log('   6. .env.production');
  
  console.log('\n💡 If you see conflicting DATABASE_URL values,');
  console.log('   the file with higher priority will override others.');
  
  console.log('\n🛠️  To fix conflicts:');
  console.log('   1. Check all .env files for DATABASE_URL');
  console.log('   2. Remove DATABASE_URL from lower priority files');
  console.log('   3. Keep only the development DATABASE_URL in .env.local');
}

checkEnvFiles(); 
const fs = require('fs');
const path = require('path');

function fixEnvConflict() {
  console.log('🔧 Fixing Environment Variable Conflict...');
  console.log('==========================================\n');
  
  const envPath = path.join(process.cwd(), '.env');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found');
    return;
  }
  
  if (!fs.existsSync(envLocalPath)) {
    console.log('❌ .env.local file not found');
    return;
  }
  
  console.log('📋 Current situation:');
  console.log('   .env - Contains production DATABASE_URL');
  console.log('   .env.local - Contains development DATABASE_URL');
  console.log('\n🔍 This creates a conflict!');
  
  // Read .env file
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if .env contains DATABASE_URL
  if (envContent.includes('DATABASE_URL=')) {
    console.log('\n❌ Found DATABASE_URL in .env file');
    console.log('   This conflicts with .env.local');
    
    // Create backup
    const backupPath = path.join(process.cwd(), '.env.backup');
    fs.writeFileSync(backupPath, envContent);
    console.log(`✅ Backup created: .env.backup`);
    
    // Remove DATABASE_URL from .env
    const lines = envContent.split('\n');
    const filteredLines = lines.filter(line => !line.trim().startsWith('DATABASE_URL='));
    const newEnvContent = filteredLines.join('\n');
    
    // Write updated .env file
    fs.writeFileSync(envPath, newEnvContent);
    console.log('✅ Removed DATABASE_URL from .env file');
    
    console.log('\n📋 Updated .env content:');
    console.log(newEnvContent);
    
    console.log('\n🎉 Conflict resolved!');
    console.log('   Now only .env.local contains DATABASE_URL');
    console.log('   This ensures development database is used locally');
    
    console.log('\n🔄 Next steps:');
    console.log('   1. Run: npm run check:env (to verify the fix)');
    console.log('   2. Run: npm run check:db (to verify database connection)');
    console.log('   3. Run: npm run db:push:dev (to set up development database)');
    console.log('   4. Run: npm run db:seed:dev (to seed development database)');
    console.log('   5. Run: npm run dev (to start development server)');
    
  } else {
    console.log('✅ No DATABASE_URL found in .env file');
    console.log('   No conflict detected');
  }
}

fixEnvConflict(); 
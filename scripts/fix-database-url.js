const fs = require('fs');
const path = require('path');

function fixDatabaseUrl() {
  console.log('🔧 Fixing Database URL for Development...');
  console.log('==========================================\n');
  
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local file not found!');
    console.log('\n📝 Please create a .env.local file with the following content:');
    console.log('\n```env');
    console.log('# Development Database');
    console.log('DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/cuss-purwakarta-dev?retryWrites=true&w=majority"');
    console.log('');
    console.log('# NextAuth Configuration (Development)');
    console.log('NEXTAUTH_URL="http://localhost:3000"');
    console.log('NEXTAUTH_SECRET="your-development-secret-key-here"');
    console.log('');
    console.log('# Google Maps API (if needed)');
    console.log('GOOGLE_MAPS_API_KEY="your-google-maps-api-key"');
    console.log('');
    console.log('# Environment');
    console.log('NODE_ENV="development"');
    console.log('```');
    process.exit(1);
  }
  
  // Read current .env.local file
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  console.log('📋 Current .env.local content:');
  console.log(envContent);
  console.log('\n🔍 Checking for database URL...');
  
  // Extract database name from DATABASE_URL
  const databaseUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);
  
  if (databaseUrlMatch) {
    const databaseUrl = databaseUrlMatch[1];
    console.log(`📊 Found DATABASE_URL: ${databaseUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    
    // Extract database name from the URL
    const dbNameMatch = databaseUrl.match(/\/\/([^?]+)\?/);
    if (dbNameMatch) {
      const dbName = dbNameMatch[1].split('/')[1];
      console.log(`📊 Database Name: ${dbName}`);
      
      if (dbName === 'cuss-purwakarta-dev') {
        console.log('✅ Already using development database URL!');
        console.log('   Database: cuss-purwakarta-dev');
        console.log('\n🎉 Your setup is correct! You can now:');
        console.log('   1. Run: npm run check:db (to verify connection)');
        console.log('   2. Run: npm run db:push:dev (to set up database schema)');
        console.log('   3. Run: npm run db:seed:dev (to seed initial data)');
        console.log('   4. Run: npm run dev (to start development server)');
      } else if (dbName === 'cuss-purwakarta') {
        console.log('❌ Found production database URL!');
        console.log('   Current: cuss-purwakarta');
        console.log('   Should be: cuss-purwakarta-dev');
        
        // Replace production database with development database
        const newEnvContent = envContent.replace(
          /DATABASE_URL="([^"]*cuss-purwakarta[^"]*)"/,
          'DATABASE_URL="$1-dev"'
        );
        
        if (newEnvContent !== envContent) {
          // Backup original file
          const backupPath = path.join(process.cwd(), '.env.local.backup');
          fs.writeFileSync(backupPath, envContent);
          console.log(`✅ Backup created: .env.local.backup`);
          
          // Write new content
          fs.writeFileSync(envPath, newEnvContent);
          console.log('✅ Updated .env.local with development database URL');
          
          console.log('\n📋 New .env.local content:');
          console.log(newEnvContent);
          
          console.log('\n🔄 Next steps:');
          console.log('   1. Run: npm run check:db (to verify the change)');
          console.log('   2. Run: npm run db:push:dev (to set up development database)');
          console.log('   3. Run: npm run db:seed:dev (to seed development database)');
          console.log('   4. Run: npm run dev (to start development server)');
          
        } else {
          console.log('❌ Could not automatically fix the database URL');
          console.log('\n💡 Manual fix required:');
          console.log('   Change your DATABASE_URL in .env.local from:');
          console.log('   cuss-purwakarta');
          console.log('   to:');
          console.log('   cuss-purwakarta-dev');
        }
      } else {
        console.log('⚠️  Unknown database name detected');
        console.log(`   Database: ${dbName}`);
        console.log('\n💡 Please ensure your DATABASE_URL points to:');
        console.log('   cuss-purwakarta-dev (for development)');
        console.log('   or');
        console.log('   cuss-purwakarta (for production)');
      }
    } else {
      console.log('❌ Could not extract database name from URL');
      console.log('   Please check your DATABASE_URL format');
    }
  } else {
    console.log('❌ DATABASE_URL not found in .env.local');
    console.log('\n💡 Please add DATABASE_URL to your .env.local file');
  }
}

fixDatabaseUrl(); 
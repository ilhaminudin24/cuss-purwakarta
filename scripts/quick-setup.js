const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 CUSS Purwakarta - Development Database Setup');
console.log('================================================\n');

// Check if .env.local exists
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
  console.log('\n⚠️  Replace the placeholder values with your actual credentials!');
  console.log('\n📖 For detailed instructions, see: DEVELOPMENT_DATABASE_SETUP.md');
  process.exit(1);
}

console.log('✅ .env.local file found!');

// Load environment variables
require('dotenv').config({ path: envPath });

if (!process.env.DATABASE_URL) {
  console.log('❌ DATABASE_URL not found in .env.local!');
  process.exit(1);
}

console.log('✅ DATABASE_URL found in .env.local');

// Function to run commands with error handling
function runCommand(command, description) {
  try {
    console.log(`\n🔄 ${description}...`);
    execSync(command, { stdio: 'inherit', env: { ...process.env } });
    console.log(`✅ ${description} completed!`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} failed!`);
    return false;
  }
}

// Run setup steps
console.log('\n🚀 Starting development database setup...\n');

// Step 1: Generate Prisma client
if (!runCommand('npm run db:generate', 'Generating Prisma client')) {
  console.log('\n❌ Setup failed at Prisma client generation');
  process.exit(1);
}

// Step 2: Test database connection
if (!runCommand('npm run db:setup:dev', 'Testing database connection')) {
  console.log('\n❌ Setup failed at database connection test');
  console.log('💡 Please check your MongoDB Atlas settings and connection string');
  process.exit(1);
}

// Step 3: Push schema to database
if (!runCommand('npm run db:push:dev', 'Pushing schema to development database')) {
  console.log('\n❌ Setup failed at schema push');
  process.exit(1);
}

// Step 4: Seed database
if (!runCommand('npm run db:seed:dev', 'Seeding development database')) {
  console.log('\n❌ Setup failed at database seeding');
  process.exit(1);
}

console.log('\n🎉 Development database setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('   1. Run: npm run dev');
console.log('   2. Open: http://localhost:3000');
console.log('   3. Test your application');
console.log('\n🛠️  Useful commands:');
console.log('   - npm run db:studio:dev (View database in browser)');
console.log('   - npm run db:reset:dev (Reset database)');
console.log('   - npm run db:migrate:dev (Copy data from production)');
console.log('\n📖 For more information, see: DEVELOPMENT_DATABASE_SETUP.md'); 
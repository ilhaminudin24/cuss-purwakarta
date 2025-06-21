const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  console.error('❌ .env.local file not found!');
  process.exit(1);
}

// Get the command from command line arguments
const command = process.argv[2];
const args = process.argv.slice(3);

if (!command) {
  console.log('❌ No command specified');
  console.log('Usage: node scripts/prisma-dev.js <command> [args...]');
  console.log('Example: node scripts/prisma-dev.js db push');
  process.exit(1);
}

try {
  console.log(`🚀 Running Prisma command: ${command} ${args.join(' ')}`);
  console.log(`📊 Using DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
  
  // Run the Prisma command with the loaded environment variables
  execSync(`npx prisma ${command} ${args.join(' ')}`, {
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('✅ Prisma command completed successfully!');
  
} catch (error) {
  console.error('❌ Prisma command failed:', error.message);
  process.exit(1);
} 
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// --- Configuration ---
// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  console.error('❌ .env.local file not found!');
  process.exit(1);
}

const devPrisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

const prodPrisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL_PROD } },
});

// --- Main Migration Function ---
async function migrateFooterData() {
  console.log('🚀 Starting Footer Data Migration to Production...');
  console.log('==================================================\n');

  try {
    // 1. Connect to both databases
    console.log('🔄 Connecting to databases...');
    await devPrisma.$connect();
    await prodPrisma.$connect();
    console.log('✅ Connected to Development and Production databases.');

    // 2. Fetch data from Development database
    console.log('\nFetching data from Development DB...');
    const companyInfo = await devPrisma.companyInfo.findMany();
    const footerSections = await devPrisma.footerSection.findMany({
      include: { links: true },
    });
    const socialMedia = await devPrisma.socialMedia.findMany();
    console.log(`  - Found ${companyInfo.length} company info records.`);
    console.log(`  - Found ${footerSections.length} footer sections.`);
    console.log(`  - Found ${socialMedia.length} social media links.`);

    if (companyInfo.length === 0 && footerSections.length === 0 && socialMedia.length === 0) {
      console.log('🟡 No footer data found in the development database. Nothing to migrate.');
      return;
    }

    // 3. Clear existing data in Production database
    console.log('\n🧹 Clearing existing footer data in Production DB...');
    // Delete in reverse order of creation to respect constraints
    await prodPrisma.footerLink.deleteMany({});
    await prodPrisma.socialMedia.deleteMany({});
    await prodPrisma.footerSection.deleteMany({});
    await prodPrisma.companyInfo.deleteMany({});
    console.log('✅ Cleared existing footer data from Production DB.');

    // 4. Insert data into Production database
    console.log('\nInserting data into Production DB...');

    // Company Info
    if (companyInfo.length > 0) {
      // The `id` is auto-generated, so we omit it.
      const companyInfoData = companyInfo.map(({ id, ...rest }) => rest);
      await prodPrisma.companyInfo.createMany({
        data: companyInfoData,
      });
      console.log(`  - ${companyInfo.length} company info record(s) migrated.`);
    }
    
    // Footer Sections and Links
    if (footerSections.length > 0) {
        for (const section of footerSections) {
            const { id, links, ...sectionData } = section;
            
            // Create the section first to get a new ID
            const newSection = await prodPrisma.footerSection.create({
                data: sectionData,
            });

            // If there are links, create them with the new section's ID
            if (links && links.length > 0) {
                const linksData = links.map(({ id, sectionId, ...linkRest }) => ({
                    ...linkRest,
                    sectionId: newSection.id, // Use the new section ID
                }));
                await prodPrisma.footerLink.createMany({
                    data: linksData,
                });
            }
        }
        console.log(`  - ${footerSections.length} footer section(s) and their links migrated.`);
    }

    // Social Media
    if (socialMedia.length > 0) {
      // The `id` is auto-generated, so we omit it.
      const socialMediaData = socialMedia.map(({ id, ...rest }) => rest);
      await prodPrisma.socialMedia.createMany({
        data: socialMediaData,
      });
      console.log(`  - ${socialMedia.length} social media link(s) migrated.`);
    }

    console.log('\n🎉 Footer data migration completed successfully!');

  } catch (error) {
    console.error('❌ Error during footer data migration:', error);
    process.exit(1);
  } finally {
    // 5. Disconnect from both databases
    await devPrisma.$disconnect();
    await prodPrisma.$disconnect();
    console.log('\n🔌 Disconnected from databases.');
  }
}

// --- Execution ---
migrateFooterData(); 
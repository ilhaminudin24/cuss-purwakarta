const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function migrateToDev() {
  console.log('📦 Migrating data to Development Database...');
  
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
  
  // You'll need to set your production DATABASE_URL temporarily
  // Add DATABASE_URL_PROD to your .env.local file for this to work
  const prodPrisma = new PrismaClient({
    datasources: { 
      db: { 
        url: process.env.DATABASE_URL_PROD || process.env.DATABASE_URL 
      } 
    }
  });
  
  const devPrisma = new PrismaClient({
    datasources: { 
      db: { 
        url: process.env.DATABASE_URL 
      } 
    }
  });
  
  try {
    console.log('🔄 Migrating services...');
    const services = await prodPrisma.service.findMany();
    for (const service of services) {
      await devPrisma.service.create({ data: service });
    }
    console.log(`✅ Migrated ${services.length} services`);
    
    console.log('🔄 Migrating FAQs...');
    const faqs = await prodPrisma.fAQ.findMany();
    for (const faq of faqs) {
      await devPrisma.fAQ.create({ data: faq });
    }
    console.log(`✅ Migrated ${faqs.length} FAQs`);
    
    console.log('🔄 Migrating navigation menus...');
    const menus = await prodPrisma.navigationMenu.findMany();
    for (const menu of menus) {
      await devPrisma.navigationMenu.create({ data: menu });
    }
    console.log(`✅ Migrated ${menus.length} navigation menus`);
    
    console.log('🔄 Migrating booking form fields...');
    const fields = await prodPrisma.bookingFormField.findMany();
    for (const field of fields) {
      await devPrisma.bookingFormField.create({ data: field });
    }
    console.log(`✅ Migrated ${fields.length} booking form fields`);
    
    console.log('🔄 Migrating service configs...');
    const configs = await prodPrisma.serviceConfig.findMany();
    for (const config of configs) {
      await devPrisma.serviceConfig.create({ data: config });
    }
    console.log(`✅ Migrated ${configs.length} service configs`);
    
    console.log('🔄 Migrating booking services...');
    const bookingServices = await prodPrisma.bookingService.findMany();
    for (const service of bookingServices) {
      await devPrisma.bookingService.create({ data: service });
    }
    console.log(`✅ Migrated ${bookingServices.length} booking services`);
    
    console.log('🔄 Migrating testimonials...');
    const testimonials = await prodPrisma.testimonial.findMany();
    for (const testimonial of testimonials) {
      await devPrisma.testimonial.create({ data: testimonial });
    }
    console.log(`✅ Migrated ${testimonials.length} testimonials`);
    
    console.log('🔄 Migrating how-to-order steps...');
    const howToOrders = await prodPrisma.howToOrder.findMany();
    for (const step of howToOrders) {
      await devPrisma.howToOrder.create({ data: step });
    }
    console.log(`✅ Migrated ${howToOrders.length} how-to-order steps`);
    
    console.log('🔄 Migrating pages...');
    const pages = await prodPrisma.page.findMany();
    for (const page of pages) {
      await devPrisma.page.create({ data: page });
    }
    console.log(`✅ Migrated ${pages.length} pages`);
    
    console.log('✅ Migration completed successfully!');
    console.log('🚀 You can now run: npm run dev');
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    console.log('💡 Make sure you have DATABASE_URL_PROD in your .env.local file');
  } finally {
    await prodPrisma.$disconnect();
    await devPrisma.$disconnect();
  }
}

migrateToDev(); 
const { PrismaClient } = require('@prisma/client');
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

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

const fields = [
  {
    label: "Nama Lengkap",
    name: "name",
    type: "text",
    required: true,
    isActive: true,
    position: 1,
  },
  {
    label: "Layanan",
    name: "service",
    type: "select",
    required: true,
    isActive: true,
    position: 2,
    options: ["Ojek", "Barang", "Belanja", "Titip/Beliin", "Lainnya"],
  },
  {
    label: "Lokasi Jemput",
    name: "pickup",
    type: "map",
    required: true,
    isActive: true,
    position: 3,
  },
  {
    label: "Tujuan",
    name: "destination",
    type: "map",
    required: true,
    isActive: true,
    position: 4,
  },
  {
    label: "Jarak (km)",
    name: "distance",
    type: "number",
    required: true,
    isActive: true,
    position: 5,
  },
  {
    label: "Langganan Mingguan",
    name: "subscription",
    type: "checkbox",
    required: false,
    isActive: true,
    position: 6,
  },
  {
    label: "Catatan tambahan (opsional)",
    name: "notes",
    type: "textarea",
    required: false,
    isActive: true,
    position: 7,
  },
];

async function seedDatabase() {
  console.log('🌱 Seeding Development Database...');
  console.log('==================================\n');
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Clear existing fields
    console.log('🗑️  Clearing existing booking form fields...');
    await prisma.bookingFormField.deleteMany({});
    console.log('✅ Cleared existing fields');
    
    // Seed new fields
    console.log('🌱 Adding booking form fields...');
    for (const field of fields) {
      const createdField = await prisma.bookingFormField.create({
        data: field
      });
      console.log(`✅ Added: ${field.label} (ID: ${createdField.id})`);
    }
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Added ${fields.length} booking form fields`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase(); 
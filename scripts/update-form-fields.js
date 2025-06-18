const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fields = [
  {
    label: "Nama Lengkap",
    name: "name",
    type: "text",
    required: true,
    position: 1,
  },
  {
    label: "Nomor WhatsApp",
    name: "whatsapp",
    type: "text",
    required: true,
    position: 2,
  },
  {
    label: "Layanan",
    name: "service",
    type: "select",
    required: true,
    position: 3,
    options: ["Ojek", "Barang", "Belanja", "Titip/Beliin", "Lainnya"],
  },
  {
    label: "Lokasi Jemput",
    name: "pickup",
    type: "map",
    required: true,
    position: 4,
  },
  {
    label: "Tujuan",
    name: "destination",
    type: "map",
    required: true,
    position: 5,
  },
  {
    label: "Jarak (km)",
    name: "distance",
    type: "number",
    required: true,
    position: 6,
  },
  {
    label: "Langganan Mingguan",
    name: "subscription",
    type: "checkbox",
    required: false,
    position: 7,
  },
  {
    label: "Catatan tambahan (opsional)",
    name: "notes",
    type: "textarea",
    required: false,
    position: 8,
  },
];

async function updateFields() {
  try {
    // Delete all existing fields
    await prisma.bookingFormField.deleteMany();
    console.log('Deleted existing fields');

    // Create new fields
    for (const field of fields) {
      await prisma.bookingFormField.create({
        data: {
          ...field,
          isActive: true,
          options: field.options ? field.options : undefined,
        },
      });
      console.log(`Added field: ${field.label}`);
    }

    console.log('Successfully updated all fields');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateFields(); 
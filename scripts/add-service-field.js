const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if service field already exists
    const existingField = await prisma.bookingFormField.findFirst({
      where: {
        name: 'service'
      }
    });

    if (existingField) {
      console.log('Service field already exists');
      return;
    }

    // Create the service field
    const serviceField = await prisma.bookingFormField.create({
      data: {
        label: 'Jenis Layanan',
        name: 'service',
        type: 'select',
        required: true,
        readonly: false,
        position: 0, // Make it appear first
        options: [], // Options will be populated dynamically from BookingService
        isActive: true,
      }
    });

    console.log('Service field added successfully:', serviceField);
  } catch (error) {
    console.error('Error adding service field:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
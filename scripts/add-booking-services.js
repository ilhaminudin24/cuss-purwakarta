const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    // Delete existing booking services
    await prisma.bookingService.deleteMany();

    // Create booking services
    const services = [
      {
        name: "Ojek",
        isActive: true,
        position: 1,
      },
      {
        name: "Barang",
        isActive: true,
        position: 2,
      },
      {
        name: "Rental",
        isActive: true,
        position: 3,
      },
    ];

    for (const service of services) {
      await prisma.bookingService.create({
        data: service,
      });
    }

    console.log("Booking services added successfully!");
  } catch (error) {
    console.error("Error adding booking services:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
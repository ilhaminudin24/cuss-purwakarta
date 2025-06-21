const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    // Delete existing service configurations
    await prisma.serviceConfig.deleteMany();

    // Create service configurations
    const services = [
      {
        serviceName: "Ojek",
        showPickup: true,
        showDestination: true,
        showDirections: true,
        firstStepFields: ["service", "name", "phone"],
        secondStepFields: ["pickup", "destination"],
      },
      {
        serviceName: "Barang",
        showPickup: true,
        showDestination: true,
        showDirections: true,
        firstStepFields: ["service", "name", "phone", "itemType", "itemWeight"],
        secondStepFields: ["pickup", "destination"],
      },
      {
        serviceName: "Rental",
        showPickup: false,
        showDestination: false,
        showDirections: false,
        firstStepFields: ["service", "name", "phone", "vehicleType", "duration"],
        secondStepFields: [],
      },
    ];

    for (const service of services) {
      await prisma.serviceConfig.create({
        data: service,
      });
    }

    console.log("Service configurations added successfully!");
  } catch (error) {
    console.error("Error adding service configurations:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
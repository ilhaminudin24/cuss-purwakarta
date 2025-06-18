const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDuplicateMenu() {
  try {
    // Find all transaction menu items
    const transactionMenus = await prisma.navigationMenu.findMany({
      where: {
        path: '/admin/transactions',
      },
    });

    console.log(`Found ${transactionMenus.length} transaction menu items`);

    // If there are duplicates, keep only the first one and delete the rest
    if (transactionMenus.length > 1) {
      const [keep, ...duplicates] = transactionMenus;
      
      // Delete duplicates
      for (const duplicate of duplicates) {
        await prisma.navigationMenu.delete({
          where: { id: duplicate.id },
        });
      }
      
      console.log(`Deleted ${duplicates.length} duplicate menu items`);
    } else {
      console.log('No duplicate menu items found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDuplicateMenu(); 
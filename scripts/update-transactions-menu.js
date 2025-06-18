const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateTransactionsMenu() {
  try {
    // Find the transactions menu item
    const transactionsMenu = await prisma.navigationMenu.findFirst({
      where: {
        path: '/admin/transactions',
      },
    });

    if (transactionsMenu) {
      // Update the existing menu item
      await prisma.navigationMenu.update({
        where: { id: transactionsMenu.id },
        data: {
          title: 'Riwayat Transaksi',
          path: '/admin/transactions',
          order: 2, // After Dashboard, before Configuration items
          isVisible: true,
          menuType: 'admin',
        },
      });
      console.log('Updated transactions menu item');
    } else {
      // Create a new menu item
      await prisma.navigationMenu.create({
        data: {
          title: 'Riwayat Transaksi',
          path: '/admin/transactions',
          order: 2, // After Dashboard, before Configuration items
          isVisible: true,
          menuType: 'admin',
        },
      });
      console.log('Created transactions menu item');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateTransactionsMenu(); 
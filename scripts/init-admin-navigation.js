const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Clear existing admin navigation
    console.log('Clearing existing admin navigation...');
    
    // First, get all admin menu items
    const existingMenus = await prisma.navigationMenu.findMany({
      where: {
        menuType: 'admin',
      },
    });

    // Delete child items first
    await prisma.navigationMenu.deleteMany({
      where: {
        menuType: 'admin',
        parentId: { not: null },
      },
    });

    // Then delete parent items
    await prisma.navigationMenu.deleteMany({
      where: {
        menuType: 'admin',
        parentId: null,
      },
    });

    // Create main menu items
    console.log('Creating main menu items...');
    const dashboard = await prisma.navigationMenu.create({
      data: {
        title: 'Dashboard',
        path: '/admin',
        icon: 'LayoutDashboard',
        order: 1,
        menuType: 'admin',
        isVisible: true,
      },
    });

    const transactions = await prisma.navigationMenu.create({
      data: {
        title: 'Transaksi',
        path: '/admin/transactions',
        icon: 'FileText',
        order: 2,
        menuType: 'admin',
        isVisible: true,
      },
    });

    const bookingForm = await prisma.navigationMenu.create({
      data: {
        title: 'Form Booking',
        path: '/admin/booking-form',
        icon: 'FormInput',
        order: 3,
        menuType: 'admin',
        isVisible: true,
      },
    });

    // Create Configuration parent menu
    const configuration = await prisma.navigationMenu.create({
      data: {
        title: 'Konfigurasi',
        icon: 'Settings',
        order: 4,
        menuType: 'admin',
        isVisible: true,
      },
    });

    // Create Configuration sub-menus
    console.log('Creating configuration sub-menus...');
    const configSubMenus = [
      {
        title: 'Layanan',
        path: '/admin/services',
        icon: 'Briefcase',
        order: 1,
      },
      {
        title: 'FAQ',
        path: '/admin/faqs',
        icon: 'HelpCircle',
        order: 2,
      },
      {
        title: 'Cara Pemesanan',
        path: '/admin/how-to-order',
        icon: 'ListOrdered',
        order: 3,
      },
      {
        title: 'Testimonial',
        path: '/admin/testimonials',
        icon: 'MessageCircle',
        order: 4,
      },
      {
        title: 'Tentang Kami',
        path: '/admin/about',
        icon: 'Info',
        order: 5,
      },
      {
        title: 'Kontak',
        path: '/admin/contact',
        icon: 'Phone',
        order: 6,
      },
      {
        title: 'Navigasi',
        path: '/admin/navigation',
        icon: 'Menu',
        order: 7,
      },
    ];

    for (const subMenu of configSubMenus) {
      await prisma.navigationMenu.create({
        data: {
          ...subMenu,
          menuType: 'admin',
          isVisible: true,
          parentId: configuration.id,
        },
      });
    }

    // Create Users menu
    const users = await prisma.navigationMenu.create({
      data: {
        title: 'Users',
        path: '/admin/users',
        icon: 'Users',
        order: 5,
        menuType: 'admin',
        isVisible: true,
      },
    });

    console.log('Admin navigation menu initialized successfully!');
  } catch (error) {
    console.error('Error initializing admin navigation:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function addFooterNavigation() {
  try {
    console.log('🚀 Starting footer navigation addition...');
    
    // Connect to database
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Footer navigation items to add
    const footerNavItems = [
      {
        title: 'Footer Management',
        path: '/admin/footer',
        order: 8,
        isVisible: true,
        menuType: 'admin'
      },
      {
        title: 'Footer Sections',
        path: '/admin/footer?tab=sections',
        order: 9,
        isVisible: false, // Hidden by default, can be enabled if needed
        menuType: 'admin'
      },
      {
        title: 'Footer Links',
        path: '/admin/footer?tab=links',
        order: 10,
        isVisible: false, // Hidden by default, can be enabled if needed
        menuType: 'admin'
      },
      {
        title: 'Social Media',
        path: '/admin/footer?tab=social-media',
        order: 11,
        isVisible: false, // Hidden by default, can be enabled if needed
        menuType: 'admin'
      },
      {
        title: 'Company Info',
        path: '/admin/footer?tab=company-info',
        order: 12,
        isVisible: false, // Hidden by default, can be enabled if needed
        menuType: 'admin'
      }
    ];

    console.log('📝 Processing footer navigation items...');

    for (const navItem of footerNavItems) {
      // Check if navigation item already exists
      const existingNav = await prisma.navigationMenu.findFirst({
        where: {
          title: navItem.title,
          menuType: 'admin'
        }
      });

      if (existingNav) {
        console.log(`⚠️  ${navItem.title} already exists, updating...`);
        
        // Update existing navigation
        await prisma.navigationMenu.update({
          where: { id: existingNav.id },
          data: navItem
        });
        
        console.log(`✅ ${navItem.title} updated successfully`);
      } else {
        console.log(`📝 Adding ${navItem.title} to admin menu...`);
        
        // Add new navigation item
        const newNav = await prisma.navigationMenu.create({
          data: navItem
        });
        
        console.log(`✅ ${navItem.title} added successfully`);
        console.log(`📋 Created: ${newNav.title} (${newNav.path}) - Order: ${newNav.order}`);
      }
    }

    // Get all admin menu items to show the complete list
    const adminMenuItems = await prisma.navigationMenu.findMany({
      where: {
        menuType: 'admin'
      },
      orderBy: {
        order: 'asc'
      }
    });

    console.log('\n📊 Current Admin Navigation Menu:');
    adminMenuItems.forEach((item, index) => {
      const status = item.isVisible ? '✅ Visible' : '❌ Hidden';
      console.log(`${index + 1}. ${item.title} (${item.path}) - Order: ${item.order} - ${status}`);
    });

    console.log('\n🎉 Footer navigation script completed successfully!');
    console.log('📍 Main Footer Management: /admin/footer');
    console.log('📋 Additional footer tabs available (currently hidden):');
    console.log('   - Footer Sections: /admin/footer?tab=sections');
    console.log('   - Footer Links: /admin/footer?tab=links');
    console.log('   - Social Media: /admin/footer?tab=social-media');
    console.log('   - Company Info: /admin/footer?tab=company-info');
    console.log('\n💡 To enable additional tabs, update their isVisible property to true');

  } catch (error) {
    console.error('❌ Error adding footer navigation:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
addFooterNavigation()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 
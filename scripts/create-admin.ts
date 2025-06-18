import { prisma } from '../src/lib/prisma';

const websiteTitles = [
  'Beranda',
  'Layanan',
  'Cara Pesan',
  'Testimoni',
  'FAQ',
  'Tentang',
  'Kontak',
];

const adminTitles = [
  'Services',
  'FAQs',
  'Navigation',
  'Users',
  'Booking-Form',
];

async function updateMenuTypes() {
  // Update website menu items
  await prisma.navigationMenu.updateMany({
    where: { title: { in: websiteTitles } },
    data: { menuType: 'website' },
  });

  // Update admin menu items
  await prisma.navigationMenu.updateMany({
    where: { title: { in: adminTitles } },
    data: { menuType: 'admin' },
  });

  console.log('Menu types updated successfully.');
  await prisma.$disconnect();
}

updateMenuTypes().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
}); 
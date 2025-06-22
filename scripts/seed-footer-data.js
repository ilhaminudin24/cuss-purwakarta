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

async function seedFooterData() {
  console.log('🌱 Starting footer data seeding...');

  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Clear existing footer data
    console.log('🧹 Clearing existing footer data...');
    await prisma.footerLink.deleteMany();
    await prisma.footerSection.deleteMany();
    await prisma.socialMedia.deleteMany();
    await prisma.companyInfo.deleteMany();
    console.log('✅ Cleared existing footer data');

    // Seed Company Info
    console.log('🏢 Seeding company information...');
    const companyInfo = await prisma.companyInfo.create({
      data: {
        companyName: 'CUSS Purwakarta',
        description: 'Layanan cuci mobil terpercaya di Purwakarta dengan kualitas premium dan pelayanan profesional.',
        address: 'Jl. Raya Purwakarta No. 123, Purwakarta, Jawa Barat 41115',
        phone: '+62 812-3456-7890',
        email: 'info@cusspurwakarta.com',
        website: 'https://cusspurwakarta.com',
        logo: '/logo.png',
        copyright: '© 2024 CUSS Purwakarta. All rights reserved.',
        isActive: true
      }
    });
    console.log('✅ Company info seeded:', companyInfo.companyName);

    // Seed Footer Sections
    console.log('📋 Seeding footer sections...');
    const sections = await Promise.all([
      prisma.footerSection.create({
        data: {
          title: 'Tentang Kami',
          content: 'CUSS Purwakarta adalah layanan cuci mobil premium yang berkomitmen memberikan pelayanan terbaik dengan kualitas tinggi.',
          position: 1,
          visible: true,
          sectionType: 'company-info'
        }
      }),
      prisma.footerSection.create({
        data: {
          title: 'Layanan',
          content: 'Berbagai layanan cuci mobil yang kami sediakan untuk memenuhi kebutuhan Anda.',
          position: 2,
          visible: true,
          sectionType: 'services'
        }
      }),
      prisma.footerSection.create({
        data: {
          title: 'Kontak',
          content: 'Hubungi kami untuk informasi lebih lanjut atau booking layanan.',
          position: 3,
          visible: true,
          sectionType: 'contact'
        }
      }),
      prisma.footerSection.create({
        data: {
          title: 'Informasi',
          content: 'Informasi penting dan berguna untuk pelanggan kami.',
          position: 4,
          visible: true,
          sectionType: 'quick-links'
        }
      })
    ]);

    console.log('✅ Footer sections seeded:', sections.length);

    // Seed Footer Links
    console.log('🔗 Seeding footer links...');

    // First, clear any existing links to avoid duplicates
    await prisma.footerLink.deleteMany({});

    // --- Dynamic Service Links ---
    console.log('🚗 Fetching services from database...');
    const servicesFromDB = await prisma.service.findMany({
      orderBy: { position: 'asc' }
    });
    console.log(`✅ Found ${servicesFromDB.length} services.`);

    const servicesSection = sections.find(s => s.sectionType === 'services');
    if (servicesSection && servicesFromDB.length > 0) {
      const serviceLinks = servicesFromDB.map((service, index) => ({
        title: service.title,
        url: `/services#${service.title.toLowerCase().replace(/\s+/g, '-')}`,
        position: index,
        visible: true,
        isExternal: false,
        sectionId: servicesSection.id,
      }));
      await prisma.footerLink.createMany({ data: serviceLinks });
      console.log(`✅ Seeded ${serviceLinks.length} service links.`);
    }
    // --- End Dynamic Service Links ---

    const otherLinks = await Promise.all([
      // About section links
      prisma.footerLink.create({
        data: {
          title: 'Tentang Kami',
          url: '/about',
          position: 1,
          visible: true,
          isExternal: false,
          sectionId: sections[0].id
        }
      }),
      prisma.footerLink.create({
        data: {
          title: 'Visi & Misi',
          url: '/about/vision-mission',
          position: 2,
          visible: true,
          isExternal: false,
          sectionId: sections[0].id
        }
      }),
      prisma.footerLink.create({
        data: {
          title: 'Tim Kami',
          url: '/about/team',
          position: 3,
          visible: true,
          isExternal: false,
          sectionId: sections[0].id
        }
      }),

      // Contact section links
      prisma.footerLink.create({
        data: {
          title: 'Hubungi Kami',
          url: '/contact',
          position: 1,
          visible: true,
          isExternal: false,
          sectionId: sections[2].id
        }
      }),
      prisma.footerLink.create({
        data: {
          title: 'Lokasi',
          url: '/contact/location',
          position: 2,
          visible: true,
          isExternal: false,
          sectionId: sections[2].id
        }
      }),
      prisma.footerLink.create({
        data: {
          title: 'Booking Online',
          url: '/booking',
          position: 3,
          visible: true,
          isExternal: false,
          sectionId: sections[2].id
        }
      }),

      // Info section links
      prisma.footerLink.create({
        data: {
          title: 'Cara Booking',
          url: '/how-to-order',
          position: 1,
          visible: true,
          isExternal: false,
          sectionId: sections[3].id
        }
      }),
      prisma.footerLink.create({
        data: {
          title: 'FAQ',
          url: '/faq',
          position: 2,
          visible: true,
          isExternal: false,
          sectionId: sections[3].id
        }
      }),
      prisma.footerLink.create({
        data: {
          title: 'Syarat & Ketentuan',
          url: '/terms',
          position: 3,
          visible: true,
          isExternal: false,
          sectionId: sections[3].id
        }
      }),
      prisma.footerLink.create({
        data: {
          title: 'Kebijakan Privasi',
          url: '/privacy',
          position: 4,
          visible: true,
          isExternal: false,
          sectionId: sections[3].id
        }
      })
    ]);

    console.log(`✅ Seeded ${otherLinks.length} other links.`);
    console.log('✅ Footer links seeding completed.');

    // Seed Social Media
    console.log('📱 Seeding social media links...');
    const socialMedia = await Promise.all([
      prisma.socialMedia.create({
        data: {
          platform: 'Facebook',
          url: 'https://facebook.com/cusspurwakarta',
          icon: 'facebook',
          position: 1,
          visible: true,
        }
      }),
      prisma.socialMedia.create({
        data: {
          platform: 'Instagram',
          url: 'https://instagram.com/cusspurwakarta',
          icon: 'instagram',
          position: 2,
          visible: true,
        }
      }),
      prisma.socialMedia.create({
        data: {
          platform: 'Twitter',
          url: 'https://twitter.com/cusspurwakarta',
          icon: 'twitter',
          position: 3,
          visible: true,
        }
      }),
      prisma.socialMedia.create({
        data: {
          platform: 'YouTube',
          url: 'https://youtube.com/cusspurwakarta',
          icon: 'youtube',
          position: 4,
          visible: true,
        }
      }),
      prisma.socialMedia.create({
        data: {
          platform: 'WhatsApp',
          url: 'https://wa.me/6281234567890',
          icon: 'whatsapp',
          position: 5,
          visible: true,
        }
      })
    ]);

    console.log('✅ Social media seeded:', socialMedia.length);

    console.log('🎉 Footer data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Company Info: 1 record`);
    console.log(`- Footer Sections: ${sections.length} records`);
    console.log(`- Footer Links: ${otherLinks.length} records`);
    console.log(`- Social Media: ${socialMedia.length} records`);

  } catch (error) {
    console.error('❌ Error seeding footer data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  seedFooterData()
    .then(() => {
      console.log('✅ Seed script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed script failed:', error);
      process.exit(1);
    });
}

module.exports = { seedFooterData }; 
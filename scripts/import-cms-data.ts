const { prisma } = require("../src/lib/prisma");

async function main() {
  try {
    // Import How to Order steps
    const orderSteps = [
      {
        title: 'Klik "CUSS Sekarang"',
        description: 'Buka halaman Beranda dan klik tombol "CUSS Sekarang" untuk mulai melakukan pemesanan.',
        icon: 'FaShoppingCart',
        position: 1,
        isActive: true,
      },
      {
        title: 'Isi Formulir',
        description: 'Isi formulir dengan lengkap: Nama, nomor WhatsApp, alamat jemput & tujuan, jenis layanan, waktu, dan metode pembayaran, lalu tekan Kirim.',
        icon: 'FaRegEdit',
        position: 2,
        isActive: true,
      },
      {
        title: 'Form Masuk ke WhatsApp Admin',
        description: 'Setelah dikirim, formulir akan otomatis masuk ke WhatsApp Admin.',
        icon: 'FaPaperPlane',
        position: 3,
        isActive: true,
      },
      {
        title: 'Konfirmasi Admin & Driver',
        description: 'Admin akan memeriksa pesanan dan menghubungi kamu via WhatsApp untuk konfirmasi detail.\n\nJika sudah diverifikasi, Admin meneruskan order ke driver, dan driver akan konfirmasi ulang jadwal jemput lewat WhatsApp.',
        icon: 'FaComments',
        position: 4,
        isActive: true,
      },
    ];

    // Import Testimonials
    const testimonials = [
      {
        name: 'Rina',
        role: 'Ibu Rumah Tangga',
        content: 'Pelayanannya ramah, cepat, dan harga terjangkau.',
        position: 1,
        isActive: true,
      },
      {
        name: 'Alvin',
        role: 'Mahasiswa',
        content: 'Titip barang ke kampus jadi gampang banget. Driver-nya juga sopan.',
        position: 2,
        isActive: true,
      },
      {
        name: 'Cici Nci',
        role: 'Pemilik Toko',
        content: 'Bantu banget buat kirim barang ke pelanggan. Respon adminnya juga cepat.',
        position: 3,
        isActive: true,
      },
      {
        name: 'Andi',
        role: 'Karyawan',
        content: 'Pernah nego harga via WhatsApp, tetap dilayani dengan baik. Mantap!',
        position: 4,
        isActive: true,
      },
    ];

    // Import About Content
    const aboutContent = [
      {
        title: 'Tentang CUSS Purwakarta',
        content: 'CUSS Purwakarta hadir sebagai jasa antar suruh di Purwakarta yang bertujuan memudahkan aktivitas sehari-hari warga Purwakarta. Kami memahami bahwa waktu dan kenyamanan adalah hal berharga, sehingga hadir dengan solusi layanan cepat, aman, dan fleksibel sesuai kebutuhan.',
        isActive: true,
      },
    ];

    // Import Contact Info
    const contactInfo = [
      {
        type: 'whatsapp',
        value: '0878-5886-0846',
        position: 1,
        isActive: true,
      },
      {
        type: 'phone',
        value: '0878-5886-0846',
        position: 2,
        isActive: true,
      },
      {
        type: 'instagram',
        value: '@cuss.purwakarta',
        position: 3,
        isActive: true,
      },
    ];

    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.orderStep.deleteMany();
    await prisma.testimonial.deleteMany();
    await prisma.aboutContent.deleteMany();
    await prisma.contactInfo.deleteMany();

    // Import new data
    console.log('Importing How to Order steps...');
    await prisma.orderStep.createMany({
      data: orderSteps,
    });

    console.log('Importing Testimonials...');
    await prisma.testimonial.createMany({
      data: testimonials,
    });

    console.log('Importing About Content...');
    await prisma.aboutContent.createMany({
      data: aboutContent,
    });

    console.log('Importing Contact Info...');
    await prisma.contactInfo.createMany({
      data: contactInfo,
    });

    console.log('Data import completed successfully!');
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
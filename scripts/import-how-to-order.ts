import { prisma } from "@/lib/prisma";

const steps = [
  {
    title: 'Klik "CUSS Sekarang"',
    content: 'Buka halaman Beranda dan klik tombol "CUSS Sekarang" untuk mulai melakukan pemesanan.',
    position: 0,
    isActive: true
  },
  {
    title: 'Isi Formulir',
    content: 'Isi formulir dengan lengkap: Nama, nomor WhatsApp, alamat jemput & tujuan, jenis layanan, waktu, dan metode pembayaran, lalu tekan Kirim.',
    position: 1,
    isActive: true
  },
  {
    title: 'Form Masuk ke WhatsApp Admin',
    content: 'Setelah dikirim, formulir akan otomatis masuk ke WhatsApp Admin.',
    position: 2,
    isActive: true
  },
  {
    title: 'Konfirmasi Admin & Driver',
    content: 'Admin akan memeriksa pesanan dan menghubungi kamu via WhatsApp untuk konfirmasi detail.\n\nJika sudah diverifikasi, Admin meneruskan order ke driver, dan driver akan konfirmasi ulang jadwal jemput lewat WhatsApp.',
    position: 3,
    isActive: true
  }
];

async function main() {
  try {
    // Delete existing steps
    await prisma.howToOrder.deleteMany();
    console.log('✅ Deleted existing steps');

    // Create new steps
    const createdSteps = await Promise.all(
      steps.map(step => prisma.howToOrder.create({ data: step }))
    );
    console.log('✅ Created new steps:', createdSteps.length);

    console.log('✨ Import completed successfully!');
  } catch (error) {
    console.error('❌ Error during import:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
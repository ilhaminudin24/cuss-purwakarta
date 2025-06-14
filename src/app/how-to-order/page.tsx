import { FaWhatsapp, FaClipboardList, FaMapMarkerAlt, FaCheckCircle, FaShoppingCart, FaRegEdit, FaPaperPlane, FaComments } from 'react-icons/fa';

const steps = [
  {
    icon: <FaShoppingCart className="text-orange-500 text-2xl mb-2" />,
    title: 'Klik “CUSS Sekarang”',
    desc: 'Buka halaman Beranda dan klik tombol “CUSS Sekarang” untuk mulai melakukan pemesanan.'
  },
  {
    icon: <FaRegEdit className="text-orange-500 text-2xl mb-2" />,
    title: 'Isi Formulir',
    desc: 'Isi formulir dengan lengkap: Nama, nomor WhatsApp, alamat jemput & tujuan, jenis layanan, waktu, dan metode pembayaran, lalu tekan Kirim.'
  },
  {
    icon: <FaPaperPlane className="text-orange-500 text-2xl mb-2" />,
    title: 'Form Masuk ke WhatsApp Admin',
    desc: 'Setelah dikirim, formulir akan otomatis masuk ke WhatsApp Admin.'
  },
  {
    icon: <FaComments className="text-orange-500 text-2xl mb-2" />,
    title: 'Konfirmasi Admin & Driver',
    desc: 'Admin akan memeriksa pesanan dan menghubungi kamu via WhatsApp untuk konfirmasi detail.\n\nJika sudah diverifikasi, Admin meneruskan order ke driver, dan driver akan konfirmasi ulang jadwal jemput lewat WhatsApp.'
  },
];

export default function HowToOrderPage() {
  return (
    <section className="max-w-2xl mx-auto py-12 px-4">
      <h2 className="text-2xl sm:text-3xl font-bold text-orange-500 mb-8 text-center">Cara Pesan</h2>
      <ol className="flex flex-col gap-6">
        {steps.map((s, i) => (
          <li key={i} className="flex items-start gap-4 bg-orange-500/10 border border-orange-200 rounded-xl p-4">
            <div>{s.icon}</div>
            <div>
              <h3 className="font-bold text-lg text-orange-500 mb-1">{`${i + 1}. ${s.title}`}</h3>
              <p className="text-black/70 text-sm">{s.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
} 
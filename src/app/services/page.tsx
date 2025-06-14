import { FaMotorcycle, FaBoxOpen, FaShoppingCart, FaHandHoldingUsd, FaUtensils, FaHandsHelping } from 'react-icons/fa';

const services = [
  {
    icon: <FaMotorcycle className="text-orange-500 text-3xl mb-2" />,
    title: 'Ojek',
    desc: 'Antar jemput cepat & nyaman di Purwakarta.'
  },
  {
    icon: <FaBoxOpen className="text-orange-500 text-3xl mb-2" />,
    title: 'Barang',
    desc: 'Kirim & ambil barang mudah, aman, dan terpercaya.'
  },
  {
    icon: <FaShoppingCart className="text-orange-500 text-3xl mb-2" />,
    title: 'Belanja',
    desc: 'Bantu belanja kebutuhan harianmu.'
  },
  {
    icon: <FaHandHoldingUsd className="text-orange-500 text-3xl mb-2" />,
    title: 'Titip/Beliin',
    desc: 'Titip atau minta dibeliin apa aja, gampang!'
  },
  {
    icon: <FaUtensils className="text-orange-500 text-3xl mb-2" />,
    title: 'Makanan',
    desc: 'Antar makanan atau pesan makanan favoritmu.'
  },
  {
    icon: <FaHandsHelping className="text-orange-500 text-3xl mb-2" />,
    title: 'Helper',
    desc: 'Butuh bantuan harian? Serahkan pada kami.'
  },
];

export default function ServicesPage() {
  return (
    <section className="max-w-4xl mx-auto py-12 px-4">
      <h2 className="text-2xl sm:text-3xl font-bold text-orange-500 mb-8 text-center">Layanan Kami</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 justify-items-center">
        {services.map((s, i) => (
          <div key={i} className="bg-orange-500/10 border border-orange-200 rounded-xl px-6 py-4 w-full max-w-[280px] flex flex-col items-center text-center shadow-sm">
            {s.icon}
            <h3 className="font-bold text-lg text-orange-500 mb-1">{s.title}</h3>
            <p className="text-black/70 text-sm">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
} 
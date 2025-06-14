const testimonials = [
  {
    name: 'Rina, Ibu Rumah Tangga',
    text: 'Pelayanannya ramah, cepat, dan harga terjangkau.'
  },
  {
    name: 'Alvin, Mahasiswa',
    text: 'Titip barang ke kampus jadi gampang banget. Driver-nya juga sopan.'
  },
  {
    name: 'Cici Nci, Pemilik Toko',
    text: 'Bantu banget buat kirim barang ke pelanggan. Respon adminnya juga cepat.'
  },
  {
    name: 'Andi, Karyawan',
    text: 'Pernah nego harga via WhatsApp, tetap dilayani dengan baik. Mantap!'
  },
];

export default function TestimonialsPage() {
  return (
    <section className="max-w-3xl mx-auto py-12 px-4">
      <h2 className="text-2xl sm:text-3xl font-bold text-orange-500 mb-8 text-center">Testimoni Pelanggan</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {testimonials.map((t, i) => (
          <div key={i} className="bg-orange-500/10 border border-orange-200 rounded-xl p-6 shadow-sm flex flex-col gap-2">
            <p className="text-black/80 text-base mb-2">"{t.text}"</p>
            <span className="text-orange-500 font-bold text-sm">- {t.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
} 
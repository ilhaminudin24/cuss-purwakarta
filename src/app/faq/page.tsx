'use client';
import { useState } from 'react';

const faqs = [
  {
    q: 'Wilayah operasional CUSS Purwakarta di mana saja?',
    a: 'Kami melayani di seluruh wilayah Purwakarta kota dan sekitarnya.'
  },
  {
    q: 'Berapa tarif layanan CUSS?',
    a: 'Rp9.000 flat untuk jarak hingga 4 km, lebih dari itu ada penambahan Rp 1.000/km.'
  },
  {
    q: 'Bisa nego harga?',
    a: 'Tentu bisa! Silakan isi formulir yang tersedia. Kami akan menghubungi Kamu melalui WhatsApp untuk berdiskusi mengenai harga. Jika Kamu memilih opsi “Tidak”, maka pemesanan akan langsung diproses sesuai tarif yang berlaku.'
  },
  {
    q: 'Ada langganan mingguan?',
    a: 'Ada, cocok untuk pelanggan rutin. Hubungi admin untuk info lebih lanjut.'
  },
  {
    q: 'Bagaimana cara pesan?',
    a: 'Cukup isi formulir pemesanan di website kami, lalu klik tombol WhatsApp untuk melanjutkan proses booking dengan tim kami.'
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="max-w-2xl mx-auto py-12 px-4">
      <h2 className="text-2xl sm:text-3xl font-bold text-orange-500 mb-8 text-center">FAQ</h2>
      <div className="flex flex-col gap-4">
        {faqs.map((f, i) => (
          <div key={i} className="border border-orange-200 rounded-xl bg-orange-500/10">
            <button
              className="w-full text-left px-6 py-4 font-bold text-orange-500 focus:outline-none flex justify-between items-center"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
            >
              {f.q}
              <span className="ml-2 text-xl">{open === i ? '-' : '+'}</span>
            </button>
            {open === i && (
              <div className="px-6 pb-4 text-black/80 text-sm animate-fade-in">
                {f.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
} 
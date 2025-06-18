import { FaWhatsapp, FaPhone, FaInstagram } from 'react-icons/fa';

export default function ContactPage() {
  return (
    <section className="max-w-md mx-auto py-12 px-4 text-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-orange-500 mb-4">Kontak Kami</h2>
      <div className="flex flex-col gap-4 items-center">
        <a href="https://wa.me/6287858860846" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-lg text-orange-500 hover:underline">
          <FaWhatsapp className="text-2xl" /> WhatsApp: 0878-5886-0846
        </a>
        <a href="tel:087858860846" className="flex items-center gap-2 text-lg text-orange-500 hover:underline">
          <FaPhone className="text-2xl" /> Telepon: 0878-5886-0846
        </a>
        <a href="https://instagram.com/cuss.purwakarta" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-lg text-orange-500 hover:underline">
          <FaInstagram className="text-2xl" /> Instagram: @cuss.purwakarta
        </a>
      </div>
    </section>
  );
} 
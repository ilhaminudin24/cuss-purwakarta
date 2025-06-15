"use client";
import { useState, useRef, useEffect } from "react";
import useSWR from "swr";
import Image from "next/image";
import ServicesSection from "./components/ServicesSection";

interface BookingFormField {
  id: string;
  label: string;
  name: string;
  type: string;
  required: boolean;
  position: number;
  options?: string[];
  isActive: boolean;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const { data: fields = [] } = useSWR<BookingFormField[]>(
    "/api/admin/booking-form-fields",
    fetcher,
    { refreshInterval: 5000 }
  );

  // Set default values when fields change
  useEffect(() => {
    if (!fields.length) return;
    const defaults: Record<string, any> = {};
    fields.forEach(f => {
      if (f.type === "checkbox") defaults[f.name] = false;
      else if (f.type === "select" && f.options?.length) defaults[f.name] = f.options[0];
      else defaults[f.name] = "";
    });
    setForm(defaults);
  }, [fields, modalOpen]);

  // Close modal on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setModalOpen(false);
      }
    }
    if (modalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const value = target.type === 'checkbox' 
      ? (target as HTMLInputElement).checked 
      : target.value;
    setForm((prev) => ({
      ...prev,
      [target.name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const missingFields = fields
      .filter(field => field.required && !form[field.name])
      .map(field => field.label);
    
    if (missingFields.length > 0) {
      alert(`Mohon lengkapi field berikut:\n${missingFields.join('\n')}`);
      return;
    }

    // Format WhatsApp message
    const message = [
      'Halo CUSS Purwakarta! 👋',
      'Saya ingin memesan layanan:',
      '',
      ...fields.map(field => {
        const value = form[field.name];
        if (field.type === 'checkbox') {
          return `${field.label}: ${value ? 'Ya' : 'Tidak'}`;
        }
        return `${field.label}: ${value || '-'}`;
      })
    ].join('\n');

    const whatsappText = encodeURIComponent(message);
    const waLink = `https://wa.me/6287858860846?text=${whatsappText}`;
    window.open(waLink, '_blank');
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12 text-center gap-8 bg-white">
      <Image src="/logo.png" alt="CUSS Purwakarta Logo" width={320} height={320} className="mx-auto" />
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black mb-2 leading-tight">
        Mau kemana? Mau nitip? Mau belanja? Mau nyuruh?<br />
        Yuk, <span className="text-orange-500">Pesan CUSS Sekarang!</span>
      </h1>
      <ServicesSection />
      <button
        onClick={() => setModalOpen(true)}
        className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl px-8 py-4 rounded-full shadow-lg transition-colors mb-2 animate-bounce"
      >
        CUSS Sekarang
      </button>
      <span className="text-black/60 text-sm">Khusus area Purwakarta • Harga mulai Rp 9.000</span>
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div ref={modalRef} className="bg-white w-full max-w-md mx-auto rounded-xl shadow-lg p-4 sm:p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-black text-2xl font-bold hover:text-orange-500 focus:outline-none z-10"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold text-orange-500 mb-4 text-center">Formulir Pesanan</h2>
            <form className="flex flex-col gap-3 text-black" onSubmit={handleSubmit}>
              {fields.map(field => {
                if (field.type === "textarea") {
                  return (
                    <div key={field.id} className="text-left">
                      <label className="block font-medium mb-1 text-black">
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <textarea
                        className="w-full border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        name={field.name}
                        placeholder={field.label}
                        value={form[field.name] ?? ""}
                        onChange={handleChange}
                        rows={3}
                        required={field.required}
                      />
                    </div>
                  );
                }
                if (field.type === "select") {
                  return (
                    <div key={field.id} className="text-left">
                      <label className="block font-medium mb-1 text-black">
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <select
                        className="w-full border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        name={field.name}
                        value={form[field.name] ?? (field.options?.[0] ?? "")}
                        onChange={handleChange}
                        required={field.required}
                      >
                        {field.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  );
                }
                if (field.type === "checkbox") {
                  return (
                    <label key={field.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name={field.name}
                        checked={!!form[field.name]}
                        onChange={handleChange}
                        required={field.required}
                      />
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </label>
                  );
                }
                // text or number
                return (
                  <div key={field.id} className="text-left">
                    <label className="block font-medium mb-1 text-black">
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      className="w-full border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                      type={field.type}
                      name={field.name}
                      placeholder={field.label}
                      value={form[field.name] ?? ""}
                      onChange={handleChange}
                      required={field.required}
                    />
                  </div>
                );
              })}
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-colors"
              >
                Kirim Pesanan
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

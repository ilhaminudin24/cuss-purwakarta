"use client";
import { useState, useRef, useEffect } from "react";
import useSWR from "swr";
import Image from "next/image";
import ServicesSection from "./components/ServicesSection";
import MapField from "./components/MapField";
import { useForm, FormProvider, Controller } from "react-hook-form";

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

interface FormData {
  [key: string]: any;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const methods = useForm();
  const { control, handleSubmit, reset } = methods;
  const { data: fields = [] } = useSWR<BookingFormField[]>(
    "/api/admin/booking-form-fields",
    fetcher,
    { refreshInterval: 5000 }
  );

  // Set default values when fields change
  useEffect(() => {
    if (!fields.length) return;
    const defaults: FormData = {};
    fields.forEach(f => {
      if (f.type === "checkbox") defaults[f.name] = false;
      else if (f.type === "select" && f.options?.length) defaults[f.name] = f.options[0];
      else if (f.type === "map") defaults[f.name] = { lat: -6.5567, lng: 107.4439, address: "" };
      else defaults[f.name] = "";
    });
    reset(defaults);
  }, [fields, reset]);

  // Close modal on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      // Don't close if click is inside modal or inside Google Autocomplete dropdown
      if (
        (modalRef.current && modalRef.current.contains(target)) ||
        (target instanceof HTMLElement && target.closest('.pac-container'))
      ) {
        return;
      }
      setModalOpen(false);
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

  const onSubmit = (data: FormData) => {
    // Format WhatsApp message
    const message = [
      'Halo CUSS Purwakarta! 👋',
      'Saya ingin memesan layanan:',
      '',
      ...fields.map(field => {
        const value = data[field.name];
        if (field.type === 'checkbox') {
          return `${field.label}: ${value ? 'Ya' : 'Tidak'}`;
        }
        if (field.type === 'map' && value) {
          return `${field.label}: ${value.address || `${value.lat}, ${value.lng}`}`;
        }
        return `${field.label}: ${value || '-'}`;
      })
    ].join('\n');

    const whatsappText = encodeURIComponent(message);
    const waLink = `https://wa.me/6287858860846?text=${whatsappText}`;
    window.open(waLink, '_blank');
  };

  const renderField = (field: BookingFormField) => {
    switch (field.type) {
      case "text":
      case "number":
      case "textarea":
      case "select":
      case "checkbox":
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: rhfField }) => {
              if (field.type === "checkbox") {
                return (
                  <input
                    type="checkbox"
                    {...rhfField}
                    checked={!!rhfField.value}
                    required={field.required}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                );
              }
              if (field.type === "textarea") {
                return (
                  <textarea
                    {...rhfField}
                    required={field.required}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                  />
                );
              }
              if (field.type === "select") {
                return (
                  <select {...rhfField} required={field.required} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    {field.options?.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                );
              }
              // text or number
              return (
                <input
                  type={field.type}
                  {...rhfField}
                  required={field.required}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              );
            }}
          />
        );
      case "map":
        return (
          <MapField
            name={field.name}
            control={control}
            label={field.label}
            required={field.required}
          />
        );
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
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
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div ref={modalRef} className="bg-white w-full max-w-lg mx-auto rounded-xl shadow-lg p-4 sm:p-8 relative animate-fade-in max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-2 right-2 text-black text-2xl font-bold hover:text-orange-500 focus:outline-none z-10"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
              <h2 className="text-xl font-bold text-orange-500 mb-4 text-center">Formulir Pesanan</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 text-black">
                {fields.map(field => (
                  <div key={field.id} className="text-left">
                    <label className="block font-medium mb-1 text-black">
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {renderField(field)}
                  </div>
                ))}
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
    </FormProvider>
  );
}

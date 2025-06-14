"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FaMotorcycle, FaBoxOpen, FaShoppingCart, FaHandHoldingUsd } from 'react-icons/fa';

interface FormData {
  name: string;
  phone: string;
  service: string;
  pickup: string;
  destination: string;
  time: string;
  notes: string;
  negotiate: string;
  payment: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  service?: string;
  pickup?: string;
  destination?: string;
  payment?: string;
}

const serviceOptions = [
  "Ojek Penumpang",
  "Antar Barang",
  "Belanjain",
  "Titip Beli",
  "Custom Request",
];

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    service: serviceOptions[0],
    pickup: "",
    destination: "",
    time: "Now",
    notes: "",
    negotiate: "No",
    payment: "Tunai",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const [showDateTime, setShowDateTime] = useState(false);
  const [dateTime, setDateTime] = useState("");

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

  // Validation
  function validate() {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = "Nama wajib diisi";
    if (!form.phone.trim()) newErrors.phone = "Nomor WA wajib diisi";
    else if (!/^\d{10,}$/.test(form.phone.trim())) newErrors.phone = "Nomor WA harus angka & minimal 10 digit";
    if (!form.service) newErrors.service = "Pilih layanan";
    if (!form.pickup.trim()) newErrors.pickup = "Alamat jemput wajib diisi";
    if (!form.destination.trim()) newErrors.destination = "Alamat tujuan wajib diisi";
    if (!form.payment) newErrors.payment = "Pilih metode pembayaran";
    return newErrors;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "time") {
      setShowDateTime(value === "Choose a time");
      if (value !== "Choose a time") setDateTime("");
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length === 0) {
      // Compose WhatsApp message
      const waktu = form.time === "Choose a time" && dateTime
        ? new Date(dateTime).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })
        : form.time;
      const msg =
        `Halo CUSS Purwakarta 👋\n` +
        `Saya ingin pesan layanan: ${form.service}\n` +
        `Nama: ${form.name}\n` +
        `No WA: ${form.phone}\n` +
        `Dari: ${form.pickup}\n` +
        `Ke: ${form.destination}\n` +
        `Waktu: ${waktu}\n` +
        `Metode Pembayaran: ${form.payment}\n` +
        `Catatan: ${form.notes || "-"}\n` +
        `Negosiasi Harga: ${form.negotiate}`;
      const url = `https://wa.me/6287858860846?text=${encodeURIComponent(msg)}`;
      window.location.href = url;
    }
  }

  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12 text-center gap-8 bg-white">
      <Image src="/logo.png" alt="CUSS Purwakarta Logo" width={320} height={320} className="mx-auto" />
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black mb-2 leading-tight">
        Mau kemana? Mau nitip? Mau belanja? Mau nyuruh?<br />
        Yuk, <span className="">Pesan CUSS Sekarang!</span>
      </h1>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <div className="bg-orange-500/10 border border-orange-200 rounded-xl px-6 py-4 min-w-[180px] flex flex-col items-center">
          <FaMotorcycle className="text-orange-500 text-3xl mb-2" />
          <span className="block text-orange-500 font-bold text-lg mb-1">Ojek</span>
          <span className="text-black/70 text-sm">Antar jemput cepat & nyaman</span>
        </div>
        <div className="bg-orange-500/10 border border-orange-200 rounded-xl px-6 py-4 min-w-[180px] flex flex-col items-center">
          <FaBoxOpen className="text-orange-500 text-3xl mb-2" />
          <span className="block text-orange-500 font-bold text-lg mb-1">Barang</span>
          <span className="text-black/70 text-sm">Kirim & ambil barang mudah</span>
        </div>
        <div className="bg-orange-500/10 border border-orange-200 rounded-xl px-6 py-4 min-w-[180px] flex flex-col items-center">
          <FaShoppingCart className="text-orange-500 text-3xl mb-2" />
          <span className="block text-orange-500 font-bold text-lg mb-1">Belanja</span>
          <span className="text-black/70 text-sm">Bantu belanja keperluanmu</span>
        </div>
        <div className="bg-orange-500/10 border border-orange-200 rounded-xl px-6 py-4 min-w-[180px] flex flex-col items-center">
          <FaHandHoldingUsd className="text-orange-500 text-3xl mb-2" />
          <span className="block text-orange-500 font-bold text-lg mb-1">Titip/Beliin</span>
          <span className="text-black/70 text-sm">Titip atau minta dibeliin apa aja</span>
        </div>
      </div>
      <button
        onClick={() => setModalOpen(true)}
        className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl px-8 py-4 rounded-full shadow-lg transition-colors mb-2 animate-bounce"
      >
        CUSS Sekarang
      </button>
      <span className="text-black/60 text-sm">Khusus area Purwakarta • Harga mulai Rp 9.000</span>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div ref={modalRef} className="bg-white w-full max-w-md mx-2 rounded-xl shadow-lg p-6 relative animate-fade-in">
            <button
              className="absolute top-2 right-2 text-black text-2xl font-bold hover:text-orange-500 focus:outline-none"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold text-orange-500 mb-4 text-center">Formulir Pesanan</h2>
            <form className="flex flex-col gap-3 text-black" onSubmit={handleSubmit}>
              <div className="text-left">
                <label className="block font-medium mb-1 text-black">Nama Lengkap <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.name ? "border-red-500" : "border-orange-300"}`}
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="off"
                />
                {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
              </div>
              <div className="text-left">
                <label className="block font-medium mb-1 text-black">No. WhatsApp Aktif <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  name="phone"
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.phone ? "border-red-500" : "border-orange-300"}`}
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="off"
                  inputMode="numeric"
                />
                {errors.phone && <span className="text-red-500 text-xs">{errors.phone}</span>}
              </div>
              <div className="text-left">
                <label className="block font-medium mb-1 text-black">Jenis Layanan <span className="text-red-500">*</span></label>
                <select
                  name="service"
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.service ? "border-red-500" : "border-orange-300"}`}
                  value={form.service}
                  onChange={handleChange}
                >
                  {serviceOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.service && <span className="text-red-500 text-xs">{errors.service}</span>}
              </div>
              <div className="text-left">
                <label className="block font-medium mb-1 text-black">Alamat Jemput <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="pickup"
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.pickup ? "border-red-500" : "border-orange-300"}`}
                  value={form.pickup}
                  onChange={handleChange}
                  autoComplete="off"
                />
                {errors.pickup && <span className="text-red-500 text-xs">{errors.pickup}</span>}
              </div>
              <div className="text-left">
                <label className="block font-medium mb-1 text-black">Alamat Tujuan <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="destination"
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.destination ? "border-red-500" : "border-orange-300"}`}
                  value={form.destination}
                  onChange={handleChange}
                  autoComplete="off"
                />
                {errors.destination && <span className="text-red-500 text-xs">{errors.destination}</span>}
              </div>
              <div className="text-left">
                <label className="block font-medium mb-1 text-black">Waktu Penjemputan</label>
                <select
                  name="time"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 border-orange-300"
                  value={form.time}
                  onChange={handleChange}
                >
                  <option value="Now">Sekarang</option>
                  <option value="Choose a time">Pilih Waktu</option>
                </select>
                {showDateTime && (
                  <input
                    type="datetime-local"
                    className="w-full border rounded px-3 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-orange-400 border-orange-300"
                    value={dateTime}
                    onChange={e => setDateTime(e.target.value)}
                    required={form.time === "Choose a time"}
                  />
                )}
              </div>
              <div className="text-left">
                <label className="block font-medium mb-1 text-black">Metode Pembayaran <span className="text-red-500">*</span></label>
                <select
                  name="payment"
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 ${errors.payment ? "border-red-500" : "border-orange-300"}`}
                  value={form.payment}
                  onChange={handleChange}
                >
                  <option value="Tunai">Tunai</option>
                  <option value="Transfer">Transfer</option>
                  <option value="QRIS">QRIS</option>
                </select>
                {errors.payment && <span className="text-red-500 text-xs">{errors.payment}</span>}
              </div>
              <div className="text-left">
                <label className="block font-medium mb-1 text-black">Catatan Tambahan</label>
                <textarea
                  name="notes"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 border-orange-300"
                  value={form.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Opsional"
                />
              </div>
              <div className="text-left flex items-center gap-3">
                <span className="font-medium text-black">Nego Harga?</span>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="negotiate"
                    value="Yes"
                    checked={form.negotiate === "Yes"}
                    onChange={handleChange}
                  />
                  <span className="text-black">Ya</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="negotiate"
                    value="No"
                    checked={form.negotiate === "No"}
                    onChange={handleChange}
                  />
                  <span className="text-black">Tidak</span>
                </label>
              </div>
              <button
                type="submit"
                className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-6 py-3 rounded-full shadow-lg text-center transition-colors"
              >
                Kirim Ke WhatsApp
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

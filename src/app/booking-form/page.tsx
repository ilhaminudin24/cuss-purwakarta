"use client";
import { useState } from "react";

const services = ["Ojek", "Barang", "Belanja", "Titip/Beliin"];

export default function BookingFormPage() {
  const [form, setForm] = useState({
    name: "",
    service: services[0],
    pickup: "",
    destination: "",
    distance: "",
    subscription: false,
    negotiate: false,
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const whatsappText = encodeURIComponent(
    `Halo CUSS Purwakarta!\n\nNama: ${form.name}\nLayanan: ${form.service}\nJemput: ${form.pickup}\nTujuan/Jarak: ${form.destination} (${form.distance} km)\nLangganan: ${form.subscription ? "Ya" : "Tidak"}\nNego Harga: ${form.negotiate ? "Ya" : "Tidak"}\nCatatan: ${form.notes}`
  );
  const waLink = `https://wa.me/6287858860846?text=${whatsappText}`;

  return (
    <section className="max-w-lg mx-auto py-12 px-4">
      <h2 className="text-2xl sm:text-3xl font-bold text-orange-500 mb-6 text-center">Formulir Booking</h2>
      <form className="flex flex-col gap-4 bg-orange-500/10 border border-orange-200 rounded-xl p-6 shadow-sm">
        <input
          className="border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          type="text"
          name="name"
          placeholder="Nama Lengkap"
          value={form.name}
          onChange={handleChange}
          required
        />
        <select
          className="border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          name="service"
          value={form.service}
          onChange={handleChange}
        >
          {services.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          className="border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          type="text"
          name="pickup"
          placeholder="Lokasi Jemput"
          value={form.pickup}
          onChange={handleChange}
          required
        />
        <input
          className="border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          type="text"
          name="destination"
          placeholder="Tujuan"
          value={form.destination}
          onChange={handleChange}
          required
        />
        <input
          className="border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          type="number"
          name="distance"
          placeholder="Jarak (km)"
          value={form.distance}
          onChange={handleChange}
          min={1}
          required
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="subscription"
            checked={form.subscription}
            onChange={handleChange}
          />
          Langganan Mingguan
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="negotiate"
            checked={form.negotiate}
            onChange={handleChange}
          />
          Nego Harga
        </label>
        <textarea
          className="border border-orange-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          name="notes"
          placeholder="Catatan tambahan (opsional)"
          value={form.notes}
          onChange={handleChange}
          rows={3}
        />
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-6 py-3 rounded-full shadow-lg text-center transition-colors"
        >
          Booking via WhatsApp
        </a>
      </form>
    </section>
  );
} 
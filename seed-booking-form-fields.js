const fetch = require("node-fetch");

const fields = [
  {
    label: "Nama Lengkap",
    name: "name",
    type: "text",
    required: true,
    isActive: true,
    position: 1,
  },
  {
    label: "Layanan",
    name: "service",
    type: "select",
    required: true,
    isActive: true,
    position: 2,
    options: ["Ojek", "Barang", "Belanja", "Titip/Beliin", "Lainnya"],
  },
  {
    label: "Lokasi Jemput",
    name: "pickup",
    type: "text",
    required: true,
    isActive: true,
    position: 3,
  },
  {
    label: "Tujuan",
    name: "destination",
    type: "text",
    required: true,
    isActive: true,
    position: 4,
  },
  {
    label: "Jarak (km)",
    name: "distance",
    type: "number",
    required: true,
    isActive: true,
    position: 5,
  },
  {
    label: "Langganan Mingguan",
    name: "subscription",
    type: "checkbox",
    required: false,
    isActive: true,
    position: 6,
  },
  {
    label: "Catatan tambahan (opsional)",
    name: "notes",
    type: "textarea",
    required: false,
    isActive: true,
    position: 7,
  },
];

async function seed() {
  for (const field of fields) {
    const res = await fetch("http://localhost:3000/api/admin/booking-form-fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(field),
    });
    const data = await res.json();
    console.log(`Added: ${field.label}`, data);
  }
}

seed(); 
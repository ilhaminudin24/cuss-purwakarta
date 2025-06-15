"use client";
import { useState } from "react";
import useSWR from "swr";

interface BookingFormField {
  id: string;
  label: string;
  name: string;
  type: string;
  required: boolean;
  position: number;
  options?: any;
  isActive: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "textarea", label: "Textarea" },
  { value: "checkbox", label: "Checkbox" },
  { value: "select", label: "Select" },
];

export default function BookingFormFieldsAdminPage() {
  const { data: fields, mutate } = useSWR<BookingFormField[]>("/api/admin/booking-form-fields", fetcher);
  const [form, setForm] = useState({ label: "", name: "", type: "text", required: false, options: "", isActive: true });
  const [editing, setEditing] = useState<BookingFormField | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    let options = form.type === "select" ? form.options.split(",").map(o => o.trim()).filter(Boolean) : undefined;
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/admin/booking-form-fields/${editing.id}` : "/api/admin/booking-form-fields";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, options }),
    });
    setLoading(false);
    if (res.ok) {
      setForm({ label: "", name: "", type: "text", required: false, options: "", isActive: true });
      setEditing(null);
      mutate();
      setMessage(editing ? "Field updated." : "Field added.");
    } else {
      setMessage("Failed to save.");
    }
  };

  const handleEdit = (field: BookingFormField) => {
    setEditing(field);
    setForm({
      label: field.label,
      name: field.name,
      type: field.type,
      required: field.required,
      options: field.type === "select" && field.options ? field.options.join(", ") : "",
      isActive: field.isActive,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this field?")) return;
    setLoading(true);
    setMessage("");
    const res = await fetch(`/api/admin/booking-form-fields/${id}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      mutate();
      setMessage("Field deleted.");
    } else {
      setMessage("Failed to delete.");
    }
  };

  const handleToggle = async (field: BookingFormField) => {
    setLoading(true);
    setMessage("");
    const res = await fetch(`/api/admin/booking-form-fields/${field.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...field, isActive: !field.isActive }),
    });
    setLoading(false);
    if (res.ok) {
      mutate();
      setMessage("Status updated.");
    } else {
      setMessage("Failed to update status.");
    }
  };

  const handleMove = async (field: BookingFormField, direction: "up" | "down") => {
    if (!fields) return;
    const idx = fields.findIndex(f => f.id === field.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= fields.length) return;
    const swapField = fields[swapIdx];
    setLoading(true);
    setMessage("");
    // Swap positions
    await fetch(`/api/admin/booking-form-fields/${field.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...field, position: swapField.position }),
    });
    await fetch(`/api/admin/booking-form-fields/${swapField.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...swapField, position: field.position }),
    });
    setLoading(false);
    mutate();
  };

  // Add this function for syncing default fields
  const handleSyncDefaults = async () => {
    setLoading(true);
    setMessage("");
    const defaults = [
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
    let success = true;
    for (const field of defaults) {
      const res = await fetch("/api/admin/booking-form-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(field),
      });
      if (!res.ok) success = false;
    }
    setLoading(false);
    mutate();
    setMessage(success ? "Default fields synced!" : "Some fields failed to sync.");
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Manage Booking Form Fields</h1>
      <button
        type="button"
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={handleSyncDefaults}
        disabled={loading}
      >
        Sync Default Fields
      </button>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 mb-6 items-end">
        <input
          className="border border-orange-300 rounded px-3 py-2 flex-1"
          type="text"
          placeholder="Label"
          value={form.label}
          onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
          required
        />
        <input
          className="border border-orange-300 rounded px-3 py-2 flex-1"
          type="text"
          placeholder="Name (unique)"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
        <select
          className="border border-orange-300 rounded px-3 py-2"
          value={form.type}
          onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
        >
          {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        {form.type === "select" && (
          <input
            className="border border-orange-300 rounded px-3 py-2 flex-1"
            type="text"
            placeholder="Options (comma separated)"
            value={form.options}
            onChange={e => setForm(f => ({ ...f, options: e.target.value }))}
            required
          />
        )}
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={form.required}
            onChange={e => setForm(f => ({ ...f, required: e.target.checked }))}
          />
          Required
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
          />
          Active
        </label>
        <button
          type="submit"
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          disabled={loading}
        >
          {editing ? "Update" : "Add"}
        </button>
        {editing && (
          <button
            type="button"
            className="ml-2 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            onClick={() => { setEditing(null); setForm({ label: "", name: "", type: "text", required: false, options: "", isActive: true }); }}
          >
            Cancel
          </button>
        )}
      </form>
      {message && <div className="mb-4 text-center text-sm text-green-600">{message}</div>}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Label</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Required</th>
            <th className="p-2 border">Active</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {fields?.map((field, idx) => (
            <tr key={field.id}>
              <td className="p-2 border">{field.label}</td>
              <td className="p-2 border">{field.name}</td>
              <td className="p-2 border">{field.type}</td>
              <td className="p-2 border text-center">{field.required ? "Yes" : "No"}</td>
              <td className="p-2 border text-center">
                <button
                  className={`px-2 py-1 rounded ${field.isActive ? "bg-green-500 text-white" : "bg-gray-300 text-gray-700"}`}
                  onClick={() => handleToggle(field)}
                  disabled={loading}
                >
                  {field.isActive ? "Active" : "Inactive"}
                </button>
              </td>
              <td className="p-2 border text-center flex gap-1 justify-center">
                <button
                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => handleEdit(field)}
                  disabled={loading}
                >
                  Edit
                </button>
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => handleDelete(field.id)}
                  disabled={loading}
                >
                  Delete
                </button>
                <button
                  className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                  onClick={() => handleMove(field, "up")}
                  disabled={loading || idx === 0}
                >
                  ↑
                </button>
                <button
                  className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                  onClick={() => handleMove(field, "down")}
                  disabled={loading || idx === fields.length - 1}
                >
                  ↓
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 
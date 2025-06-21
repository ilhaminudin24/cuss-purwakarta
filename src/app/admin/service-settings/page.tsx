'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface ServiceConfig {
  id: string;
  serviceName: string;
  showPickup: boolean;
  showDestination: boolean;
  showDirections: boolean;
  firstStepFields: string[];
  secondStepFields: string[];
}

interface BookingFormField {
  id: string;
  label: string;
  name: string;
  type: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  position: number;
}

export default function ServiceSettingsAdmin() {
  const [configs, setConfigs] = useState<ServiceConfig[]>([]);
  const [fields, setFields] = useState<BookingFormField[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [editingConfig, setEditingConfig] = useState<ServiceConfig | null>(null);
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  useEffect(() => {
    fetchConfigs();
    fetchFields();
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/admin/service-config');
      if (!response.ok) throw new Error('Failed to fetch configs');
      const data = await response.json();
      setConfigs(data);
    } catch (error) {
      console.error('Error fetching configs:', error);
    }
  };

  const fetchFields = async () => {
    try {
      const response = await fetch('/api/admin/booking-form-fields');
      if (!response.ok) throw new Error('Failed to fetch fields');
      const data = await response.json();
      setFields(data);
    } catch (error) {
      console.error('Error fetching fields:', error);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const configData = {
        ...data,
        firstStepFields: data.firstStepFields ? data.firstStepFields.split(',').map((f: string) => f.trim()) : [],
        secondStepFields: data.secondStepFields ? data.secondStepFields.split(',').map((f: string) => f.trim()) : [],
        showPickup: data.showPickup === 'true',
        showDestination: data.showDestination === 'true',
        showDirections: data.showDirections === 'true',
      };

      const url = editingConfig
        ? `/api/admin/service-config/${editingConfig.id}`
        : '/api/admin/service-config';
      const method = editingConfig ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData),
      });

      if (!response.ok) throw new Error('Failed to save config');

      await fetchConfigs();
      setEditingConfig(null);
      reset();
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  const editConfig = (config: ServiceConfig) => {
    setEditingConfig(config);
    Object.entries(config).forEach(([key, value]) => {
      if (key === 'firstStepFields' || key === 'secondStepFields') {
        setValue(key, (value as string[]).join(', '));
      } else {
        setValue(key, value);
      }
    });
  };

  const deleteConfig = async (id: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return;

    try {
      const response = await fetch(`/api/admin/service-config/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete config');

      await fetchConfigs();
    } catch (error) {
      console.error('Error deleting config:', error);
    }
  };

  const fieldTypeExplanations = {
    text: 'Input teks biasa untuk data seperti nama, alamat, dll.',
    number: 'Input angka untuk data numerik seperti jumlah, harga, dll.',
    select: 'Dropdown untuk memilih satu opsi dari beberapa pilihan yang tersedia.',
    checkbox: 'Kotak centang untuk opsi ya/tidak.',
    textarea: 'Area teks besar untuk catatan atau deskripsi panjang.',
    map: 'Input lokasi dengan peta untuk memilih titik jemput atau tujuan.',
  };

  const availableFields = fields.map(field => ({
    ...field,
    explanation: fieldTypeExplanations[field.type as keyof typeof fieldTypeExplanations] || 'Tipe input khusus',
  }));

  // Filter active services only
  const activeServices = services;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Konfigurasi Layanan</h1>
        <p className="text-gray-600 mb-4">
          Di sini Anda dapat mengatur konfigurasi untuk setiap jenis layanan, termasuk field apa saja yang akan ditampilkan
          dan bagaimana form pemesanan akan berfungsi.
        </p>
      </div>

      {/* Field Type Documentation */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Panduan Tipe Field</h2>
        <div className="grid gap-4">
          {Object.entries(fieldTypeExplanations).map(([type, explanation]) => (
            <div key={type} className="border-b pb-4">
              <h3 className="font-medium text-gray-800">{type}</h3>
              <p className="text-gray-600">{explanation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Available Fields */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Field yang Tersedia</h2>
        <div className="grid gap-4">
          {availableFields.map(field => (
            <div key={field.id} className="border-b pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">{field.label}</h3>
                  <p className="text-sm text-gray-500">Nama field: {field.name}</p>
                  <p className="text-sm text-gray-500">Tipe: {field.type}</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {field.type}
                </span>
              </div>
              <p className="text-gray-600 mt-2">{field.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingConfig ? 'Edit Konfigurasi' : 'Tambah Konfigurasi Baru'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-medium">Jenis Layanan</label>
            <select {...register('serviceName')} className="w-full p-2 border rounded">
              <option value="">Pilih Layanan</option>
              {services.map(service => (
                <option key={service.id} value={service.title}>{service.title}</option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Pilih jenis layanan yang akan dikonfigurasi
            </p>
          </div>

          <div>
            <label className="block mb-2 font-medium">Tampilkan Lokasi Jemput</label>
            <select {...register('showPickup')} className="w-full p-2 border rounded">
              <option value="true">Ya</option>
              <option value="false">Tidak</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Aktifkan jika layanan membutuhkan lokasi penjemputan
            </p>
          </div>

          <div>
            <label className="block mb-2 font-medium">Tampilkan Lokasi Tujuan</label>
            <select {...register('showDestination')} className="w-full p-2 border rounded">
              <option value="true">Ya</option>
              <option value="false">Tidak</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Aktifkan jika layanan membutuhkan lokasi tujuan
            </p>
          </div>

          <div>
            <label className="block mb-2 font-medium">Tampilkan Rute</label>
            <select {...register('showDirections')} className="w-full p-2 border rounded">
              <option value="true">Ya</option>
              <option value="false">Tidak</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Aktifkan untuk menampilkan rute antara lokasi jemput dan tujuan
            </p>
          </div>

          <div className="col-span-2">
            <label className="block mb-2 font-medium">Field Halaman Pertama</label>
            <input
              {...register('firstStepFields')}
              className="w-full p-2 border rounded"
              placeholder="name, service, notes"
            />
            <p className="text-sm text-gray-500 mt-1">
              Masukkan nama field yang akan ditampilkan di halaman pertama, pisahkan dengan koma.
              Contoh: name, service, notes
            </p>
          </div>

          <div className="col-span-2">
            <label className="block mb-2 font-medium">Field Halaman Kedua</label>
            <input
              {...register('secondStepFields')}
              className="w-full p-2 border rounded"
              placeholder="pickup, destination"
            />
            <p className="text-sm text-gray-500 mt-1">
              Masukkan nama field yang akan ditampilkan di halaman kedua, pisahkan dengan koma.
              Contoh: pickup, destination
            </p>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editingConfig ? 'Update Konfigurasi' : 'Tambah Konfigurasi'}
          </button>
        </div>
      </form>

      {/* Configurations List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Konfigurasi yang Ada</h2>
        {configs.map(config => (
          <div
            key={config.id}
            className="bg-white p-6 rounded-lg shadow flex items-start justify-between"
          >
            <div className="flex-grow">
              <h3 className="font-medium text-lg mb-2">{config.serviceName}</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p>Lokasi Jemput: {config.showPickup ? '✓' : '✗'}</p>
                  <p>Lokasi Tujuan: {config.showDestination ? '✓' : '✗'}</p>
                  <p>Tampilkan Rute: {config.showDirections ? '✓' : '✗'}</p>
                </div>
                
                <div>
                  <p className="font-medium">Field Halaman 1:</p>
                  <p className="text-gray-500">{config.firstStepFields.join(', ')}</p>
                  <p className="font-medium mt-2">Field Halaman 2:</p>
                  <p className="text-gray-500">{config.secondStepFields.join(', ')}</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => editConfig(config)}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
              <button
                onClick={() => deleteConfig(config.id)}
                className="text-red-600 hover:text-red-800"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
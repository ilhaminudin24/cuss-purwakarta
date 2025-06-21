"use client";

import { useState, useEffect } from 'react';
import MultiStepBookingForm from './components/MultiStepBookingForm';
import ServicesSection from './components/ServicesSection';
import FAQSection from './components/FAQSection';

interface BookingFormField {
  id: string;
  label: string;
  name: string;
  type: string;
  required: boolean;
  readonly: boolean;
  position: number;
  options?: string[];
  isActive: boolean;
  autoCalculate?: {
    type: string;
    from: string;
    to: string;
  };
}

interface ServiceConfig {
  id: string;
  serviceName: string;
  showPickup: boolean;
  showDestination: boolean;
  showDirections: boolean;
  firstStepFields: string[];
  secondStepFields: string[];
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fields, setFields] = useState<BookingFormField[]>([]);
  const [configs, setConfigs] = useState<ServiceConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchFields(), fetchConfigs()]);
  }, []);

  const fetchFields = async () => {
    try {
      const response = await fetch('/api/admin/booking-form-fields');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch fields');
      }
      const data = await response.json();
      
      // Filter out duplicate fields by name
      const uniqueFields = data.filter((field: BookingFormField, index: number, self: BookingFormField[]) =>
        index === self.findIndex((f) => f.name === field.name)
      );

      // Find the service field to get available services
      const serviceField = uniqueFields.find((field: BookingFormField) => field.name === 'service');
      if (serviceField && serviceField.options && serviceField.options.length > 0) {
        // Set the first service as default selected service
        setSelectedService(serviceField.options[0]);
      }
      
      setFields(uniqueFields);
      setError(null);
    } catch (error) {
      console.error('Error fetching fields:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/admin/service-config');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch service configs');
      }
      const data = await response.json();
      setConfigs(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching service configs:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to submit form');

      setIsModalOpen(false);

      // WhatsApp redirect logic
      const adminNumber = '6287858860846'; // Change to your admin WhatsApp number
      
      // Start with basic message
      let messageLines = ['Halo Admin, saya ingin melakukan pemesanan:'];

      // Add dynamic fields
      fields.forEach(field => {
        let value = data[field.name];
        
        // Format the value based on field type
        if (field.type === 'map') {
          value = value?.address || '-';
        } else if (field.type === 'distance') {
          value = value ? value.toFixed(2) + ' km' : '-';
        } else if (field.type === 'checkbox') {
          value = value ? 'Ya' : 'Tidak';
        } else if (field.type === 'number') {
          value = value ? value.toFixed(2) : '-';
        } else if (value === undefined || value === null || value === '') {
          value = '-';
        }

        messageLines.push(`${field.label}: ${value}`);
      });

      const message = messageLines.join('\n');
      const waUrl = `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-orange-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-orange-500 mb-6">
            CUSS Purwakarta
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Layanan pengantaran terpercaya untuk kebutuhan Anda di Purwakarta
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 transition-colors shadow-lg"
          >
            Buat Pesanan
          </button>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <ServicesSection />
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-orange-50">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-orange-500 mb-8 text-center">
            Pertanyaan yang Sering Diajukan
          </h2>
          <FAQSection />
        </div>
      </section>

      {/* Booking Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <MultiStepBookingForm
            fields={fields}
            configs={configs}
            selectedService={selectedService}
            onServiceChange={setSelectedService}
            onSubmit={handleSubmit}
            onClose={() => setIsModalOpen(false)}
          />
        </div>
      )}
    </main>
  );
}

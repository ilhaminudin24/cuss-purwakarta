"use client";

import { useEffect, useState } from 'react';
import { FaMotorcycle, FaBoxOpen, FaShoppingCart, FaHandHoldingUsd, FaUtensils, FaHandsHelping } from 'react-icons/fa';

// Map of icon names to components
const iconMap: { [key: string]: any } = {
  'FaMotorcycle': FaMotorcycle,
  'FaBoxOpen': FaBoxOpen,
  'FaShoppingCart': FaShoppingCart,
  'FaHandHoldingUsd': FaHandHoldingUsd,
  'FaUtensils': FaUtensils,
  'FaHandsHelping': FaHandsHelping,
};

interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        if (!response.ok) throw new Error('Failed to fetch services');
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto py-12 px-4">
      <h2 className="text-2xl sm:text-3xl font-bold text-orange-500 mb-8 text-center">Layanan Kami</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 justify-items-center">
        {services.map((service) => {
          const IconComponent = iconMap[service.icon];
          return (
            <div key={service.id} className="bg-orange-500/10 border border-orange-200 rounded-xl px-6 py-4 w-full max-w-[280px] flex flex-col items-center text-center shadow-sm">
              {IconComponent && <IconComponent className="text-orange-500 text-3xl mb-2" />}
              <h3 className="font-bold text-lg text-orange-500 mb-1">{service.title}</h3>
              <p className="text-black/70 text-sm">{service.description}</p>
          </div>
          );
        })}
      </div>
    </section>
  );
} 
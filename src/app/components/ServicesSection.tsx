"use client";

import { useState, useEffect } from 'react';
import { FaMotorcycle, FaBoxOpen, FaShoppingCart, FaHandHoldingUsd, FaUtensils, FaHandsHelping } from 'react-icons/fa';

interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  position: number;
}

const iconMap: { [key: string]: any } = {
  'FaMotorcycle': FaMotorcycle,
  'FaBoxOpen': FaBoxOpen,
  'FaShoppingCart': FaShoppingCart,
  'FaHandHoldingUsd': FaHandHoldingUsd,
  'FaUtensils': FaUtensils,
  'FaHandsHelping': FaHandsHelping,
};

export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        if (!response.ok) throw new Error('Failed to fetch services');
        const data = await response.json();
        setServices(data);
      } catch (error) {
        setError('Error loading services');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center mb-8 max-w-4xl mx-auto">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-orange-500/10 border border-orange-200 rounded-xl px-6 py-4 w-full max-w-[280px] animate-pulse">
            <div className="h-12 w-12 bg-orange-200 rounded-full mx-auto mb-2"></div>
            <div className="h-6 w-24 bg-orange-200 rounded mx-auto mb-1"></div>
            <div className="h-4 w-full bg-orange-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center mb-8">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center mb-8 max-w-4xl mx-auto">
      {services.map((service) => {
        const IconComponent = iconMap[service.icon];
        return (
          <div key={service.id} className="bg-orange-500/10 border border-orange-200 rounded-xl px-6 py-4 w-full max-w-[280px] flex flex-col items-center">
            {IconComponent && <IconComponent className="text-orange-500 text-3xl mb-2" />}
            <span className="block text-orange-500 font-bold text-lg mb-1">{service.title}</span>
            <span className="text-black/70 text-sm text-center">{service.description}</span>
          </div>
        );
      })}
    </div>
  );
} 
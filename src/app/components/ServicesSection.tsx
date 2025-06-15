"use client";

import { useState } from "react";
import { FaMotorcycle, FaBoxOpen, FaShoppingCart, FaHandHoldingUsd, FaUtensils, FaHandsHelping } from 'react-icons/fa';
import useSWR from "swr";

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
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

const fetcher = (url: string) => fetch(url, {
  cache: 'no-store',
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
}).then((res) => res.json());

export default function ServicesSection() {
  const { data: services, error, isLoading } = useSWR<Service[]>('/api/services', fetcher, {
    refreshInterval: 5000, // Refresh every 5 seconds
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 0, // Disable deduping
    keepPreviousData: false // Don't keep previous data
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-orange-500 font-bold">Error loading services</div>
      </div>
    );
  }

  // Sort services by position if not already sorted by the API
  const sortedServices = services?.slice().sort((a, b) => a.position - b.position);

  return (
    <section className="max-w-4xl mx-auto py-12 px-4">
      <h2 className="text-2xl sm:text-3xl font-bold text-orange-500 mb-8 text-center">Layanan Kami</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 justify-items-center">
        {sortedServices?.map((service: Service) => {
          const IconComponent = iconMap[service.icon] || FaMotorcycle;
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
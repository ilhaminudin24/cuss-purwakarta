"use client";

import { useState } from "react";
import { FaMotorcycle, FaBoxOpen, FaShoppingCart, FaHandHoldingUsd, FaUtensils, FaHandsHelping } from 'react-icons/fa';
import useSWR from 'swr';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const iconMap: { [key: string]: any } = {
  'FaMotorcycle': FaMotorcycle,
  'FaBoxOpen': FaBoxOpen,
  'FaShoppingCart': FaShoppingCart,
  'FaHandHoldingUsd': FaHandHoldingUsd,
  'FaUtensils': FaUtensils,
  'FaHandsHelping': FaHandsHelping,
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ServicesSection() {
  const { data: services, error, isLoading } = useSWR<Service[]>('/api/services', fetcher, {
    refreshInterval: 5000, // Refresh every 5 seconds
  });

  if (isLoading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Loading services...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Error loading services
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-orange-500 sm:text-4xl">
            Our Services
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            We provide a wide range of services to meet your needs
          </p>
        </div>

        <div className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {services?.map((service: Service) => {
            const Icon = iconMap[service.icon] || FaMotorcycle;
            return (
              <div
                key={service.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-base text-gray-500">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 
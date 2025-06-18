"use client";

import { useEffect, useState } from 'react';
import { FaShoppingCart, FaRegEdit, FaPaperPlane, FaComments } from 'react-icons/fa';

// Map of icon names to components
const iconMap: { [key: string]: any } = {
  'FaShoppingCart': FaShoppingCart,
  'FaRegEdit': FaRegEdit,
  'FaPaperPlane': FaPaperPlane,
  'FaComments': FaComments,
};

interface OrderStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  position: number;
  isActive: boolean;
}

export default function HowToOrderPage() {
  const [steps, setSteps] = useState<OrderStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSteps = async () => {
      try {
        const response = await fetch('/api/how-to-order');
        if (!response.ok) throw new Error('Failed to fetch steps');
        const data = await response.json();
        setSteps(data.filter((step: OrderStep) => step.isActive));
      } catch (error) {
        console.error('Error fetching steps:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSteps();
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
      <h2 className="text-2xl sm:text-3xl font-bold text-orange-500 mb-8 text-center">Cara Pemesanan</h2>
      <div className="space-y-8">
        {steps.map((step, index) => {
          const IconComponent = iconMap[step.icon];
          return (
            <div key={step.id} className="flex items-start gap-4 bg-orange-500/10 border border-orange-200 rounded-xl p-6">
              <div className="flex-shrink-0">
                {IconComponent && (
                  <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                    <IconComponent className="text-white text-2xl" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg text-orange-500 mb-2">
                  {index + 1}. {step.title}
                </h3>
                <p className="text-black/70">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
} 
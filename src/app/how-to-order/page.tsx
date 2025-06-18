"use client";

import { useEffect, useState } from 'react';
import { FaShoppingCart, FaRegEdit, FaPaperPlane, FaComments } from 'react-icons/fa';

interface Step {
  id: string;
  title: string;
  content: string;
  position: number;
}

export default function HowToOrderPage() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSteps = async () => {
      try {
        const response = await fetch('/api/how-to-order');
        if (!response.ok) throw new Error('Failed to fetch steps');
        const data = await response.json();
        setSteps(data);
      } catch (error) {
        console.error('Error fetching steps:', error);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSteps();
  }, []);

  const getIcon = (index: number) => {
    const icons = [
      <FaShoppingCart key="cart" className="text-orange-500 text-2xl mb-2" />,
      <FaRegEdit key="edit" className="text-orange-500 text-2xl mb-2" />,
      <FaPaperPlane key="send" className="text-orange-500 text-2xl mb-2" />,
      <FaComments key="chat" className="text-orange-500 text-2xl mb-2" />
    ];
    return icons[index % icons.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-2xl mx-auto py-12 px-4">
      <h2 className="text-2xl sm:text-3xl font-bold text-orange-500 mb-8 text-center">Cara Pesan</h2>
      <ol className="flex flex-col gap-6">
        {steps.map((step, i) => (
          <li key={step.id} className="flex items-start gap-4 bg-orange-500/10 border border-orange-200 rounded-xl p-4">
            <div>{getIcon(i)}</div>
            <div>
              <h3 className="font-bold text-lg text-orange-500 mb-1">{`${i + 1}. ${step.title}`}</h3>
              <p className="text-black/70 text-sm whitespace-pre-line">{step.content}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
} 
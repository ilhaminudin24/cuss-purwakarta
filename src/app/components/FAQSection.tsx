"use client";

import { useState } from "react";
import useSWR from "swr";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const fetcher = (url: string) => fetch(url, {
  cache: 'no-store',
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
}).then((res) => res.json());

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { data: faqs, error, isLoading } = useSWR<FAQ[]>('/api/faqs', fetcher, {
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
        <div className="text-orange-500 font-bold">Error loading FAQs</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {faqs?.map((faq, index) => (
        <div
          key={faq.id}
          className="bg-orange-500/10 border border-orange-200 rounded-xl overflow-hidden"
        >
          <button
            className="w-full px-6 py-4 text-left flex justify-between items-center"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <span className="font-bold text-orange-500">{faq.question}</span>
            <span className="text-orange-500">
              {openIndex === index ? '−' : '+'}
            </span>
          </button>
          {openIndex === index && (
            <div className="px-6 pb-4">
              <p className="text-black/70">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 
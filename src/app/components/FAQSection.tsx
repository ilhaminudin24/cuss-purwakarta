"use client";

import { useState } from "react";
import useSWR from 'swr';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function FAQSection() {
  const { data: faqs, error, isLoading } = useSWR<FAQ[]>('/api/faqs', fetcher, {
    refreshInterval: 5000, // Refresh every 5 seconds
  });

  if (isLoading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Loading FAQs...
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
              Error loading FAQs
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
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Find answers to common questions about our services
          </p>
        </div>

        <div className="mt-12 max-w-3xl mx-auto">
          <dl className="space-y-6">
            {faqs?.map((faq: FAQ) => (
              <div
                key={faq.id}
                className="bg-white shadow rounded-lg overflow-hidden"
              >
                <div className="px-6 py-4">
                  <dt className="text-lg font-medium text-gray-900">
                    {faq.question}
                  </dt>
                  <dd className="mt-2 text-base text-gray-500">
                    {faq.answer}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
} 
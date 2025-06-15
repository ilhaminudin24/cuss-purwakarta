"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export default function FAQSection() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await fetch("/api/faqs");
      if (!response.ok) throw new Error("Failed to fetch FAQs");
      const data = await response.json();
      setFaqs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch FAQs");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load FAQs. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h2 className="text-2xl sm:text-3xl font-bold text-orange-500 mb-8 text-center">FAQ</h2>
      <div className="space-y-4">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="border border-orange-200 rounded-xl bg-orange-500/10 overflow-hidden"
          >
            <button
              onClick={() => toggleFaq(faq.id)}
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-orange-500/5 focus:outline-none"
            >
              <span className="font-bold text-orange-500">{faq.question}</span>
              {openFaqId === faq.id ? (
                <ChevronUp className="h-5 w-5 text-orange-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-orange-500" />
              )}
            </button>
            {openFaqId === faq.id && (
              <div className="px-6 pb-4 text-black/70 text-sm animate-fade-in">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 
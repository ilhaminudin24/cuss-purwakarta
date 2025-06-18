"use client";

import { useEffect, useState } from 'react';
import { FaWhatsapp, FaInstagram, FaEnvelope } from 'react-icons/fa';

interface ContactPage {
  id: string;
  title: string;
  content: string;
}

export default function ContactPage() {
  const [page, setPage] = useState<ContactPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/contact');
        if (!response.ok) throw new Error('Failed to fetch content');
        const data = await response.json();
        setPage(data);
      } catch (error) {
        console.error('Error fetching content:', error);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          Content not found.
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-3xl mx-auto py-12 px-4">
      <h2 className="text-2xl sm:text-3xl font-bold text-orange-500 mb-8 text-center">{page.title}</h2>
      <div className="prose max-w-none mb-8">
        {page.content.split('\n').map((paragraph, index) => (
          <p key={index} className="text-black/70 mb-4">
            {paragraph}
          </p>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a
          href="https://wa.me/6285156317473"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors"
        >
          <FaWhatsapp size={20} />
          <span>WhatsApp</span>
        </a>
        <a
          href="https://instagram.com/cuss.purwakarta"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-pink-500 text-white py-3 px-6 rounded-lg hover:bg-pink-600 transition-colors"
        >
          <FaInstagram size={20} />
          <span>Instagram</span>
        </a>
        <a
          href="mailto:cusspurwakarta@gmail.com"
          className="flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <FaEnvelope size={20} />
          <span>Email</span>
        </a>
      </div>
    </section>
  );
} 
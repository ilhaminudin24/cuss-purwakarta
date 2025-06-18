"use client";

import { useEffect, useState } from 'react';

interface AboutPage {
  id: string;
  title: string;
  content: string;
}

export default function AboutPage() {
  const [page, setPage] = useState<AboutPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/about');
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
      <div className="prose max-w-none">
        {page.content.split('\n').map((paragraph, index) => (
          <p key={index} className="text-black/70 mb-4">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
} 
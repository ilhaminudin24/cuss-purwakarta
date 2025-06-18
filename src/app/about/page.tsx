"use client";

import { useEffect, useState } from 'react';

interface AboutContent {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
}

export default function AboutPage() {
  const [aboutContent, setAboutContent] = useState<AboutContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const response = await fetch('/api/about');
        if (!response.ok) throw new Error('Failed to fetch about content');
        const data = await response.json();
        setAboutContent(data.filter((content: AboutContent) => content.isActive));
      } catch (error) {
        console.error('Error fetching about content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutContent();
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
      <h2 className="text-2xl sm:text-3xl font-bold text-orange-500 mb-8 text-center">Tentang Kami</h2>
      <div className="space-y-8">
        {aboutContent.map((content) => (
          <div key={content.id} className="bg-orange-500/10 border border-orange-200 rounded-xl p-6">
            <h3 className="font-bold text-xl text-orange-500 mb-4">{content.title}</h3>
            <div className="prose prose-orange max-w-none">
              {content.content.split('\n').map((paragraph, index) => (
                <p key={index} className="text-black/70 mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
} 
"use client";

import { useEffect, useState } from 'react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  position: number;
  isActive: boolean;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials');
        if (!response.ok) throw new Error('Failed to fetch testimonials');
        const data = await response.json();
        setTestimonials(data.filter((testimonial: Testimonial) => testimonial.isActive));
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
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
      <h2 className="text-2xl sm:text-3xl font-bold text-orange-500 mb-8 text-center">Testimonial</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-orange-500/10 border border-orange-200 rounded-xl p-6">
            <div className="flex flex-col h-full">
              <blockquote className="flex-grow mb-4">
                <p className="text-black/70 italic">&ldquo;{testimonial.content}&rdquo;</p>
              </blockquote>
              <div>
                <p className="font-bold text-orange-500">{testimonial.name}</p>
                <p className="text-sm text-black/60">{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
} 
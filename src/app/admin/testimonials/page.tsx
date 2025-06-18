"use client";
import { useState } from "react";

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

  // ... rest of the code ...
} 
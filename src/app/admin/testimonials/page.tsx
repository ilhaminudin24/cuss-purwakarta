"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FaPlus, FaEdit, FaTrash, FaArrowUp, FaArrowDown } from "react-icons/fa";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  position: number;
  isActive: boolean;
}

export default function TestimonialsPage() {
  const { data: session } = useSession();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({ name: "", role: "", content: "" });

  // ... rest of the code ...
} 
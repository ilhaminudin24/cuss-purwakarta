"use client";

import { useState, useEffect } from "react";
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
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    content: "",
    isActive: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/testimonials");
      if (!response.ok) throw new Error("Failed to fetch testimonials");
      const data = await response.json();
      setTestimonials(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch testimonials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingTestimonial 
        ? `/api/admin/testimonials/${editingTestimonial.id}` 
        : "/api/admin/testimonials";
      const method = editingTestimonial ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save testimonial");

      await fetchTestimonials();
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save testimonial");
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      content: testimonial.content,
      isActive: testimonial.isActive
    });
    setEditingTestimonial(testimonial);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete testimonial");

      await fetchTestimonials();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete testimonial");
    }
  };

  const handleMoveItem = async (id: string, direction: "up" | "down") => {
    try {
      const currentIndex = testimonials.findIndex((item) => item.id === id);
      if (
        (direction === "up" && currentIndex === 0) ||
        (direction === "down" && currentIndex === testimonials.length - 1)
      )
        return;

      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      const currentItem = testimonials[currentIndex];
      const targetItem = testimonials[newIndex];

      // Update both items' positions
      await Promise.all([
        fetch(`/api/admin/testimonials/${currentItem.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...currentItem,
            position: targetItem.position,
          }),
        }),
        fetch(`/api/admin/testimonials/${targetItem.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...targetItem,
            position: currentItem.position,
          }),
        }),
      ]);

      await fetchTestimonials();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reorder testimonials");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTestimonial(null);
    setFormData({
      name: "",
      role: "",
      content: "",
      isActive: true
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Testimonials Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center gap-2"
        >
          <FaPlus size={20} />
          Add Testimonial
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Content
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {testimonials.map((testimonial) => (
              <tr key={testimonial.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMoveItem(testimonial.id, "up")}
                      className="text-gray-400 hover:text-gray-600"
                      disabled={testimonials.indexOf(testimonial) === 0}
                    >
                      <FaArrowUp size={16} />
                    </button>
                    <span className="text-sm text-gray-900">{testimonial.position}</span>
                    <button
                      onClick={() => handleMoveItem(testimonial.id, "down")}
                      className="text-gray-400 hover:text-gray-600"
                      disabled={testimonials.indexOf(testimonial) === testimonials.length - 1}
                    >
                      <FaArrowDown size={16} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{testimonial.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{testimonial.role}</div>
                </td>
                <td className="px-6 py-4 whitespace-normal">
                  <div className="text-sm text-gray-900">{testimonial.content}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      testimonial.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {testimonial.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(testimonial)}
                    className="text-orange-500 hover:text-orange-600 mr-4"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <FaTrash size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Role
                </label>
                <input
                  type="text"
                  id="role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Content
                </label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600"
                >
                  {editingTestimonial ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 
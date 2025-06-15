"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaMotorcycle, FaBoxOpen, FaShoppingCart, FaHandHoldingUsd, FaUtensils, FaHandsHelping } from 'react-icons/fa';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  position: number;
}

const iconOptions = [
  { value: 'FaMotorcycle', label: 'Motorcycle', icon: FaMotorcycle },
  { value: 'FaBoxOpen', label: 'Box', icon: FaBoxOpen },
  { value: 'FaShoppingCart', label: 'Shopping Cart', icon: FaShoppingCart },
  { value: 'FaHandHoldingUsd', label: 'Money', icon: FaHandHoldingUsd },
  { value: 'FaUtensils', label: 'Utensils', icon: FaUtensils },
  { value: 'FaHandsHelping', label: 'Helping Hands', icon: FaHandsHelping },
];

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    icon: "",
    title: "",
    description: "",
    position: 0,
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/admin/services");
      if (!response.ok) throw new Error("Failed to fetch services");
      const data = await response.json();
      setServices(data);
    } catch (error) {
      setError("Error loading services");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const url = editingService 
        ? `/api/admin/services/${editingService.id}`
        : "/api/admin/services";
      
      const response = await fetch(url, {
        method: editingService ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(editingService ? "Failed to update service" : "Failed to create service");

      await fetchServices();
      handleCloseModal();
    } catch (error) {
      setError(editingService ? "Error updating service" : "Error creating service");
      console.error(error);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      icon: service.icon,
      title: service.title,
      description: service.description,
      position: service.position,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete service");

      await fetchServices();
    } catch (error) {
      setError("Error deleting service");
      console.error(error);
    }
  };

  const handleMoveUp = async (service: Service) => {
    if (service.position === 0) return;

    try {
      const prevService = services.find(s => s.position === service.position - 1);
      if (!prevService) return;

      // Swap positions
      await Promise.all([
        fetch(`/api/admin/services/${service.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...service, position: service.position - 1 }),
        }),
        fetch(`/api/admin/services/${prevService.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...prevService, position: service.position }),
        }),
      ]);

      await fetchServices();
    } catch (error) {
      setError("Error updating service position");
      console.error(error);
    }
  };

  const handleMoveDown = async (service: Service) => {
    if (service.position === services.length - 1) return;

    try {
      const nextService = services.find(s => s.position === service.position + 1);
      if (!nextService) return;

      // Swap positions
      await Promise.all([
        fetch(`/api/admin/services/${service.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...service, position: service.position + 1 }),
        }),
        fetch(`/api/admin/services/${nextService.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...nextService, position: service.position }),
        }),
      ]);

      await fetchServices();
    } catch (error) {
      setError("Error updating service position");
      console.error(error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({ icon: "", title: "", description: "", position: 0 });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Services</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Service
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      >
                        Position
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Icon
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Title
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                      >
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {services.map((service) => {
                      const IconComponent = iconOptions.find(opt => opt.value === service.icon)?.icon;
                      return (
                        <tr key={service.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleMoveUp(service)}
                                disabled={service.position === 0}
                                className={`p-1 rounded ${
                                  service.position === 0
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                                }`}
                              >
                                <FaArrowUp className="w-4 h-4" />
                              </button>
                              <span className="w-6 text-center">{service.position}</span>
                              <button
                                onClick={() => handleMoveDown(service)}
                                disabled={service.position === services.length - 1}
                                className={`p-1 rounded ${
                                  service.position === services.length - 1
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                                }`}
                              >
                                <FaArrowDown className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                            {IconComponent && <IconComponent className="text-indigo-500 text-2xl" />}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {service.title}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {service.description}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => handleEdit(service)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(service.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>

              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={handleCloseModal}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                      {editingService ? "Edit Service" : "Add New Service"}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Icon
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {iconOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setFormData({ ...formData, icon: option.value })}
                              className={`p-2 rounded-lg border ${
                                formData.icon === option.value
                                  ? "border-indigo-500 bg-indigo-50"
                                  : "border-gray-300 hover:border-indigo-300"
                              }`}
                            >
                              <option.icon className="w-6 h-6 mx-auto" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                          Position
                        </label>
                        <input
                          type="number"
                          id="position"
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                          min="0"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        />
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                        >
                          {editingService ? "Update" : "Create"}
                        </button>
                        <button
                          type="button"
                          onClick={handleCloseModal}
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
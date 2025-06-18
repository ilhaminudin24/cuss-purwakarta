"use client";

import AdminLayoutClient from './AdminLayoutClient';

export default function AdminPage() {
  return (
    <AdminLayoutClient>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats cards */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-2">Total Services</h2>
            <p className="text-3xl font-bold">6</p>
            <a href="/admin/services" className="text-blue-600 hover:underline mt-2 inline-block">
              View all services
            </a>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-2">Total FAQs</h2>
            <p className="text-3xl font-bold">5</p>
            <a href="/admin/faqs" className="text-blue-600 hover:underline mt-2 inline-block">
              View all FAQs
            </a>
          </div>

          {/* Add more stats cards as needed */}
        </div>
      </div>
    </AdminLayoutClient>
  );
} 
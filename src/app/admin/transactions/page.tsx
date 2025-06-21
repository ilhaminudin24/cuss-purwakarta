"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

interface Transaction {
  id: string;
  name: string;
  whatsapp: string | null;
  service: string;
  pickup: {
    lat: number;
    lng: number;
    address: string;
  };
  destination: {
    lat: number;
    lng: number;
    address: string;
  };
  distance: number;
  subscription: boolean;
  notes: string | null;
  status: string;
  dynamicFields: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

interface BookingFormField {
  id: string;
  label: string;
  name: string;
  type: string;
  required: boolean;
  readonly: boolean;
  position: number;
  options?: string[];
  isActive: boolean;
}

export default function TransactionsPage() {
  const { data: session, status } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [formFields, setFormFields] = useState<BookingFormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/admin/login');
    }
  }, [status]);

  useEffect(() => {
    Promise.all([
      fetchTransactions(currentPage),
      fetchFormFields()
    ]);
  }, [currentPage]);

  const fetchTransactions = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/transactions?page=${page}&limit=10`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data.transactions);
      setTotalPages(data.totalPages);
      setSelectedIds([]); // Reset selection on page change
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchFormFields = async () => {
    try {
      const response = await fetch('/api/admin/booking-form-fields');
      if (!response.ok) throw new Error('Failed to fetch form fields');
      const data = await response.json();
      setFormFields(data);
    } catch (err) {
      console.error('Error fetching form fields:', err);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(transactions.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        const response = await fetch('/api/transactions', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: [id] }),
        });
        if (!response.ok) throw new Error('Failed to delete transaction');
        await fetchTransactions(currentPage); // Refresh data
      } catch (err) {
        alert('Error: ' + (err instanceof Error ? err.message : 'An error occurred'));
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert('Please select transactions to delete.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} transactions?`)) {
      try {
        const response = await fetch('/api/transactions', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedIds }),
        });
        if (!response.ok) throw new Error('Failed to delete transactions');
        await fetchTransactions(currentPage); // Refresh data
      } catch (err) {
        alert('Error: ' + (err instanceof Error ? err.message : 'An error occurred'));
      }
    }
  };

  const formatValue = (value: any, type: string) => {
    if (value === null || value === undefined) return '-';
    if (type === 'checkbox') return value ? 'Yes' : 'No';
    if (type === 'map') return value.address || '-';
    if (type === 'number' && typeof value === 'number') return value.toFixed(2);
    return value.toString();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        {selectedIds.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete Selected ({selectedIds.length})
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedIds.length > 0 && selectedIds.length === transactions.length}
                />
              </th>
              <th className="px-4 py-2 border">Actions</th>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">WhatsApp</th>
              <th className="px-4 py-2 border">Service</th>
              <th className="px-4 py-2 border">Pickup</th>
              <th className="px-4 py-2 border">Destination</th>
              <th className="px-4 py-2 border">Distance</th>
              <th className="px-4 py-2 border">Status</th>
              {formFields.map(field => (
                !['name', 'whatsapp', 'service', 'pickup', 'destination', 'distance', 'status'].includes(field.name) && (
                  <th key={field.id} className="px-4 py-2 border">
                    {field.label}
                  </th>
                )
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className={`hover:bg-gray-50 ${selectedIds.includes(transaction.id) ? 'bg-blue-50' : ''}`}>
                <td className="px-4 py-2 border">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(transaction.id)}
                    onChange={() => handleSelect(transaction.id)}
                  />
                </td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
                <td className="px-4 py-2 border">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 border">{transaction.name}</td>
                <td className="px-4 py-2 border">{transaction.whatsapp || '-'}</td>
                <td className="px-4 py-2 border">{transaction.service}</td>
                <td className="px-4 py-2 border">{transaction.pickup.address}</td>
                <td className="px-4 py-2 border">{transaction.destination.address}</td>
                <td className="px-4 py-2 border">{transaction.distance.toFixed(2)} km</td>
                <td className="px-4 py-2 border">{transaction.status}</td>
                {formFields.map(field => {
                  if (!['name', 'whatsapp', 'service', 'pickup', 'destination', 'distance', 'status'].includes(field.name)) {
                    const value = transaction.dynamicFields?.[field.name];
                    return (
                      <td key={field.id} className="px-4 py-2 border">
                        {formatValue(value, field.type)}
                      </td>
                    );
                  }
                  return null;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-center space-x-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
} 
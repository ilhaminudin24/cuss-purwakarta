"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Transaction {
  id: string;
  name: string;
  whatsapp: string;
  service: string;
  pickup: {
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    lat: number;
    lng: number;
  };
  distance: number;
  subscription: boolean;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function TransactionsPage() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);

  useEffect(() => {
    if (session) {
      fetchTransactions();
    }
  }, [session]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/transactions", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        console.error("Failed to fetch transactions:", await response.text());
        throw new Error("Failed to fetch transactions");
      }
      
      const data = await response.json();
      console.log("Fetched transactions:", data);
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const updateTransactionStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to update transaction status");
      await fetchTransactions();
    } catch (error) {
      console.error("Error updating transaction status:", error);
      alert("Failed to update transaction status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      const response = await fetch("/api/transactions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }

      await fetchTransactions(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete transaction");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedTransactions.length) {
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedTransactions.length} transactions?`)) {
      return;
    }

    try {
      const response = await fetch("/api/transactions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedTransactions }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete transactions");
      }

      setSelectedTransactions([]); // Clear selection
      await fetchTransactions(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete transactions");
    }
  };

  const toggleSelectAll = () => {
    if (selectedTransactions.length === transactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(transactions.map(t => t.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedTransactions.includes(id)) {
      setSelectedTransactions(selectedTransactions.filter(t => t !== id));
    } else {
      setSelectedTransactions([...selectedTransactions, id]);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Please log in to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Riwayat Transaksi</h1>
        {selectedTransactions.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Delete Selected ({selectedTransactions.length})
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="border-b px-4 py-2">
                <input
                  type="checkbox"
                  checked={selectedTransactions.length === transactions.length}
                  onChange={toggleSelectAll}
                  className="h-4 w-4"
                />
              </th>
              <th className="border-b px-4 py-2 text-left">Tanggal</th>
              <th className="border-b px-4 py-2 text-left">Nama Lengkap</th>
              <th className="border-b px-4 py-2 text-left">Nomor WhatsApp</th>
              <th className="border-b px-4 py-2 text-left">Layanan</th>
              <th className="border-b px-4 py-2 text-left">Lokasi Jemput</th>
              <th className="border-b px-4 py-2 text-left">Tujuan</th>
              <th className="border-b px-4 py-2 text-left">Jarak (km)</th>
              <th className="border-b px-4 py-2 text-left">Langganan</th>
              <th className="border-b px-4 py-2 text-left">Catatan</th>
              <th className="border-b px-4 py-2 text-left">Status</th>
              <th className="border-b px-4 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="border-b px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.includes(transaction.id)}
                    onChange={() => toggleSelect(transaction.id)}
                    className="h-4 w-4"
                  />
                </td>
                <td className="border-b px-4 py-2">{format(new Date(transaction.createdAt), "dd MMM yyyy HH:mm", { locale: id })}</td>
                <td className="border-b px-4 py-2">{transaction.name}</td>
                <td className="border-b px-4 py-2">{transaction.whatsapp}</td>
                <td className="border-b px-4 py-2">{transaction.service}</td>
                <td className="border-b px-4 py-2">{transaction.pickup.address}</td>
                <td className="border-b px-4 py-2">{transaction.destination.address}</td>
                <td className="border-b px-4 py-2">{transaction.distance} km</td>
                <td className="border-b px-4 py-2">
                  {transaction.subscription ? "Ya" : "Tidak"}
                </td>
                <td className="border-b px-4 py-2 text-sm max-w-xs truncate" title={transaction.notes || ""}>
                  {transaction.notes || "-"}
                </td>
                <td className="border-b px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.status === "completed" ? "bg-green-100 text-green-800" :
                    transaction.status === "cancelled" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {transaction.status === "completed" ? "Selesai" :
                     transaction.status === "cancelled" ? "Dibatalkan" :
                     "Menunggu"}
                  </span>
                </td>
                <td className="border-b px-4 py-2">
                  <select
                    value={transaction.status}
                    onChange={(e) => updateTransactionStatus(transaction.id, e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="pending">Menunggu</option>
                    <option value="completed">Selesai</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </td>
                <td className="border-b px-4 py-2">
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
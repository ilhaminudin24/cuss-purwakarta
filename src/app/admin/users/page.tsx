"use client";

import { useState } from "react";
import useSWR from "swr";

interface User {
  id: string;
  name?: string;
  email?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function UsersPage() {
  const { data: users, mutate } = useSWR<User[]>("/api/admin/users", fetcher);
  const [showAdd, setShowAdd] = useState(false);
  const [showChangePwd, setShowChangePwd] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [pwdForm, setPwdForm] = useState({ password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setShowAdd(false);
      setForm({ name: "", email: "", password: "" });
      mutate();
      setMessage("User added successfully.");
    } else {
      setMessage(data.error || "Failed to add user.");
    }
  };

  const handleChangePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const res = await fetch(`/api/admin/users/${showChangePwd}/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pwdForm),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setShowChangePwd(null);
      setPwdForm({ password: "" });
      setMessage("Password changed successfully.");
    } else {
      setMessage(data.error || "Failed to change password.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <button
        className="mb-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        onClick={() => setShowAdd((v) => !v)}
      >
        {showAdd ? "Cancel" : "Add New User"}
      </button>
      {showAdd && (
        <form onSubmit={handleAdd} className="mb-4 space-y-2 bg-gray-50 p-4 rounded shadow">
          <input
            type="text"
            placeholder="Name"
            className="w-full border px-2 py-1 rounded"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full border px-2 py-1 rounded"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border px-2 py-1 rounded"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            minLength={8}
            pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$"
            title="Password must be at least 8 characters and contain letters and numbers."
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add User"}
          </button>
        </form>
      )}
      {message && <div className="mb-4 text-center text-sm text-green-600">{message}</div>}
      <table className="w-full border mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((user) => (
            <tr key={user.id}>
              <td className="p-2 border">{user.name}</td>
              <td className="p-2 border">{user.email}</td>
              <td className="p-2 border">
                <button
                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
                  onClick={() => setShowChangePwd(user.id)}
                >
                  Change Password
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showChangePwd && (
        <form onSubmit={handleChangePwd} className="mt-4 space-y-2 bg-gray-50 p-4 rounded shadow">
          <h2 className="font-bold mb-2">Change Password</h2>
          <input
            type="password"
            placeholder="New Password"
            className="w-full border px-2 py-1 rounded"
            value={pwdForm.password}
            onChange={(e) => setPwdForm({ password: e.target.value })}
            minLength={8}
            pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$"
            title="Password must be at least 8 characters and contain letters and numbers."
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
          <button
            type="button"
            className="ml-2 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            onClick={() => setShowChangePwd(null)}
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
} 
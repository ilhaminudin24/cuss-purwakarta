"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";

interface NavigationItem {
  id: string;
  title: string;
  path: string;
  order: number;
  isVisible: boolean;
}

export default function NavigationPage() {
  const [menuItems, setMenuItems] = useState<NavigationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    path: "",
    order: 0,
    isVisible: true,
    menuType: "admin",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch("/api/admin/navigation");
      if (!response.ok) throw new Error("Failed to fetch menu items");
      const data = await response.json();
      setMenuItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch menu items");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditing
        ? `/api/admin/navigation/${editingId}`
        : "/api/admin/navigation";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save menu item");

      await fetchMenuItems();
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save menu item");
    }
  };

  const handleEdit = (item: NavigationItem) => {
    setFormData({
      title: item.title,
      path: item.path,
      order: item.order,
      isVisible: item.isVisible,
      menuType: "admin",
    });
    setEditingId(item.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    try {
      const response = await fetch(`/api/admin/navigation/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete menu item");

      await fetchMenuItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete menu item");
    }
  };

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const item = menuItems.find((item) => item.id === id);
      if (!item) return;

      const response = await fetch(`/api/admin/navigation/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...item,
          isVisible: !currentVisibility,
        }),
      });

      if (!response.ok) throw new Error("Failed to update visibility");

      await fetchMenuItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update visibility");
    }
  };

  const handleMoveItem = async (id: string, direction: "up" | "down") => {
    try {
      const currentIndex = menuItems.findIndex((item) => item.id === id);
      if (
        (direction === "up" && currentIndex === 0) ||
        (direction === "down" && currentIndex === menuItems.length - 1)
      )
        return;

      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      const currentItem = menuItems[currentIndex];
      const targetItem = menuItems[newIndex];

      // Update both items' orders
      await Promise.all([
        fetch(`/api/admin/navigation/${currentItem.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...currentItem,
            order: targetItem.order,
          }),
        }),
        fetch(`/api/admin/navigation/${targetItem.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...targetItem,
            order: currentItem.order,
          }),
        }),
      ]);

      await fetchMenuItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reorder menu items");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      title: "",
      path: "",
      order: 0,
      isVisible: true,
      menuType: "admin",
    });
  };

  const handleInitializeMenu = async () => {
    if (!confirm("This will reset all menu items to default. Continue?")) return;

    try {
      const response = await fetch("/api/admin/navigation/init", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to initialize menu");

      await fetchMenuItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize menu");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Navigation Menu Management</h1>
        <div className="flex gap-4">
          <button
            onClick={handleInitializeMenu}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            Initialize Menu
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Menu Item
          </button>
        </div>
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
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Path
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
            {menuItems.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMoveItem(item.id, "up")}
                      className="text-gray-400 hover:text-gray-600"
                      disabled={menuItems.indexOf(item) === 0}
                    >
                      <ArrowUp size={16} />
                    </button>
                    <span className="text-sm text-gray-900">{item.order}</span>
                    <button
                      onClick={() => handleMoveItem(item.id, "down")}
                      className="text-gray-400 hover:text-gray-600"
                      disabled={menuItems.indexOf(item) === menuItems.length - 1}
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.path}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleVisibility(item.id, item.isVisible)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.isVisible
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.isVisible ? (
                      <>
                        <Eye size={14} className="mr-1" />
                        Visible
                      </>
                    ) : (
                      <>
                        <EyeOff size={14} className="mr-1" />
                        Hidden
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? "Edit Menu Item" : "Add New Menu Item"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="path"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Path
                </label>
                <input
                  type="text"
                  id="path"
                  value={formData.path}
                  onChange={(e) =>
                    setFormData({ ...formData, path: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="order"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Order
                </label>
                <input
                  type="number"
                  id="order"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isVisible}
                    onChange={(e) =>
                      setFormData({ ...formData, isVisible: e.target.checked })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Visible</span>
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
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  {isEditing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 
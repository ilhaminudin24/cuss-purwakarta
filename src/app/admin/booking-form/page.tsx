"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FaPlus, FaEdit, FaTrash, FaArrowUp, FaArrowDown } from "react-icons/fa";

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
  autoCalculate?: {
    type: "distance";
    from: string;
    to: string;
  };
}

interface FormData {
  label: string;
  name: string;
  type: string;
  required: boolean;
  readonly: boolean;
  options?: string[];
  autoCalculate?: {
    type: "distance";
    from: string;
    to: string;
  };
}

export default function BookingFormFieldsPage() {
  const { data: session } = useSession();
  const [fields, setFields] = useState<BookingFormField[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<BookingFormField | null>(null);
  const [formData, setFormData] = useState<FormData>({
    label: "",
    name: "",
    type: "text",
    required: false,
    readonly: false,
    options: [],
  });

  const [availableMapFields, setAvailableMapFields] = useState<BookingFormField[]>([]);

  const fieldTypes = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "textarea", label: "Text Area" },
    { value: "select", label: "Select" },
    { value: "checkbox", label: "Checkbox" },
    { value: "map", label: "Map" },
  ];

  const handleTypeChange = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      type,
      options: type === "select" ? prev.options || [""] : undefined,
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(formData.options || [])];
    newOptions[index] = value;
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...(prev.options || []), ""],
    }));
  };

  const removeOption = (index: number) => {
    const newOptions = [...(formData.options || [])];
    newOptions.splice(index, 1);
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingField
      ? `/api/admin/booking-form-fields/${editingField.id}`
      : "/api/admin/booking-form-fields";
    const method = editingField ? "PUT" : "POST";

    // If it's a number field, check if we want to enable auto-calculation
    const finalFormData = { ...formData };
    if (formData.type === "number" && formData.autoCalculate?.from && formData.autoCalculate?.to) {
      finalFormData.readonly = true; // Force readonly for auto-calculated fields
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalFormData),
      });

      if (!response.ok) throw new Error("Failed to save field");

      await fetchFields();
      setIsModalOpen(false);
      setEditingField(null);
      setFormData({
        label: "",
        name: "",
        type: "text",
        required: false,
        readonly: false,
        options: [],
        autoCalculate: undefined,
      });
    } catch (error) {
      console.error("Error saving field:", error);
      alert("Failed to save field");
    }
  };

  const fetchFields = async () => {
    try {
      const response = await fetch("/api/admin/booking-form-fields");
      if (!response.ok) throw new Error("Failed to fetch fields");
      const data = await response.json();
      setFields(data);
    } catch (error) {
      console.error("Error fetching fields:", error);
    }
  };

  const handleEdit = (field: BookingFormField) => {
    setEditingField(field);
    setFormData({
      label: field.label,
      name: field.name,
      type: field.type,
      required: field.required,
      readonly: field.readonly || false,
      options: field.options || [],
      autoCalculate: field.autoCalculate,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this field?")) return;

    try {
      const response = await fetch(`/api/admin/booking-form-fields/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete field");

      await fetchFields();
    } catch (error) {
      console.error("Error deleting field:", error);
      alert("Failed to delete field");
    }
  };

  const handleToggleActive = async (field: BookingFormField) => {
    try {
      const response = await fetch(`/api/admin/booking-form-fields/${field.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...field, isActive: !field.isActive }),
      });

      if (!response.ok) throw new Error("Failed to update field");

      await fetchFields();
    } catch (error) {
      console.error("Error updating field:", error);
      alert("Failed to update field");
    }
  };

  const handleMove = async (field: BookingFormField, direction: "up" | "down") => {
    const currentIndex = fields.findIndex((f) => f.id === field.id);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === fields.length - 1)
    )
      return;

    const newPosition =
      direction === "up"
        ? fields[currentIndex - 1].position
        : fields[currentIndex + 1].position;

    try {
      const response = await fetch(`/api/admin/booking-form-fields/${field.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...field, position: newPosition }),
      });

      if (!response.ok) throw new Error("Failed to update field position");

      await fetchFields();
    } catch (error) {
      console.error("Error updating field position:", error);
      alert("Failed to update field position");
    }
  };

  const handleSyncDefaultFields = async () => {
    if (!confirm("This will reset all fields to default. Continue?")) return;

    try {
      const response = await fetch("/api/admin/booking-form-fields/sync-default", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to sync default fields");

      await fetchFields();
      alert("Default fields have been synced successfully");
    } catch (error) {
      console.error("Error syncing default fields:", error);
      alert("Failed to sync default fields");
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  useEffect(() => {
    // Update available map fields whenever fields change
    setAvailableMapFields(fields.filter(f => f.type === "map"));
  }, [fields]);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Please log in to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Booking Form Fields</h1>
        <div className="space-x-4">
          <button
            onClick={handleSyncDefaultFields}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Sync Default Fields
          </button>
          <button
            onClick={() => {
              setEditingField(null);
              setFormData({
                label: "",
                name: "",
                type: "text",
                required: false,
                readonly: false,
                options: [],
              });
              setIsModalOpen(true);
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Add Field
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Label
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Required
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Read Only
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fields.map((field) => (
              <tr key={field.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleMove(field, "up")}
                      className="text-gray-400 hover:text-gray-600"
                      disabled={field.position === 0}
                    >
                      <FaArrowUp />
                    </button>
                    <button
                      onClick={() => handleMove(field, "down")}
                      className="text-gray-400 hover:text-gray-600"
                      disabled={field.position === fields.length - 1}
                    >
                      <FaArrowDown />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{field.label}</td>
                <td className="px-6 py-4 whitespace-nowrap">{field.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {field.required ? "Yes" : "No"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {field.readonly ? "Yes" : "No"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleActive(field)}
                    className={`px-2 py-1 rounded ${
                      field.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {field.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(field)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(field.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingField ? "Edit Field" : "Add Field"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Label
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, label: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {fieldTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              {formData.type === "select" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Options
                  </label>
                  {formData.options?.map((option, index) => (
                    <div key={index} className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOption}
                    className="mt-2 text-blue-600 hover:text-blue-900"
                  >
                    <FaPlus /> Add Option
                  </button>
                </div>
              )}
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.required}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        required: e.target.checked,
                      }))
                    }
                    className="mr-2"
                  />
                  Required
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.readonly}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        readonly: e.target.checked,
                      }))
                    }
                    className="mr-2"
                  />
                  Read Only
                </label>
              </div>
              {formData.type === "number" && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Auto Calculate
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={!!formData.autoCalculate}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            autoCalculate: e.target.checked 
                              ? { type: "distance", from: "", to: "" }
                              : undefined
                          }));
                        }}
                        className="mr-2"
                      />
                      Calculate Distance Between Points
                    </label>
                    
                    {formData.autoCalculate && (
                      <div className="ml-6 space-y-2">
                        <div>
                          <label className="block text-sm text-gray-600">From</label>
                          <select
                            value={formData.autoCalculate.from}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                autoCalculate: {
                                  ...prev.autoCalculate!,
                                  from: e.target.value
                                }
                              }));
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="">Select starting point</option>
                            {availableMapFields.map(field => (
                              <option key={field.id} value={field.name}>
                                {field.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600">To</label>
                          <select
                            value={formData.autoCalculate.to}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                autoCalculate: {
                                  ...prev.autoCalculate!,
                                  to: e.target.value
                                }
                              }));
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="">Select destination point</option>
                            {availableMapFields.map(field => (
                              <option key={field.id} value={field.name}>
                                {field.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingField(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  {editingField ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 
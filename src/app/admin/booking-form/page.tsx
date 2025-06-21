"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FaPlus, FaEdit, FaTrash, FaArrowUp, FaArrowDown, FaGripVertical } from "react-icons/fa";
import { useForm } from 'react-hook-form';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';
import FieldForm from "@/app/components/FieldForm";

interface ServiceConfig {
  serviceName: string;
  showInStep: number;
  showMap: boolean;
  showDirections: boolean;
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

  const fieldTypes = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "textarea", label: "Text Area" },
    { value: "select", label: "Select" },
    { value: "checkbox", label: "Checkbox" },
    { value: "map", label: "Map" },
  ];

  const { register, handleSubmit, reset, setValue, watch } = useForm();

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

  const handleSubmitField = async (data: any) => {
    let options: string[] = [];
    if (typeof data.options === 'string') {
      options = data.options.split(',').map((opt: string) => opt.trim()).filter((opt: string) => opt.length > 0);
    } else if (Array.isArray(data.options)) {
      options = data.options;
    }
    const newField = {
      ...data,
      id: editingField?.id || Date.now().toString(),
      position: editingField?.position || fields.length,
      options,
    };

    try {
      const response = await fetch(
        editingField ? `/api/admin/booking-form-fields/${editingField.id}` : "/api/admin/booking-form-fields",
        {
          method: editingField ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newField),
        }
      );

      if (!response.ok) throw new Error("Failed to save field");

      await fetchFields();
      setEditingField(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving field:", error);
      alert("Failed to save field");
    }
  };

  const deleteField = async (id: string) => {
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

  const editField = (field: BookingFormField) => {
    const latestField = fields.find(f => f.id === field.id) || field;
    setEditingField(latestField);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingField(null);
    setIsModalOpen(false);
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

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const reorderedFields = Array.from(fields);
    const [removed] = reorderedFields.splice(sourceIndex, 1);
    reorderedFields.splice(destinationIndex, 0, removed);

    // Update positions
    const updatedFields = reorderedFields.map((field, index) => ({
      ...field,
      position: index,
    }));

    // Update in database
    try {
      for (const field of updatedFields) {
        await fetch(`/api/admin/booking-form-fields/${field.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(field),
        });
      }

      await fetchFields();
    } catch (error) {
      console.error("Error updating field positions:", error);
      alert("Failed to update field positions");
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  // Debug: log fields before rendering
  console.log('BookingFormFieldsPage fields:', fields);

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Booking Form Fields</h1>
        <button
          onClick={() => {
            setEditingField(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add New Field
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="fields">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {fields.map((field, index) => (
                <Draggable key={field.id} draggableId={field.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`mb-2 p-4 bg-white rounded-lg shadow-sm border ${
                        field.isActive ? 'border-gray-200' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div {...provided.dragHandleProps}>
                            <FaGripVertical className="text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-medium">{field.label}</h3>
                            <p className="text-sm text-gray-500">
                              {field.type} {field.required && '(Required)'} {field.readonly && '(Read Only)'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleActive(field)}
                            className={`p-2 rounded-full ${
                              field.isActive
                                ? 'text-green-600 hover:bg-green-100'
                                : 'text-red-600 hover:bg-red-100'
                            }`}
                          >
                            {field.isActive ? '✓' : '×'}
                          </button>
                          <button
                            onClick={() => editField(field)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => deleteField(field.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Field Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingField ? 'Edit Field' : 'Add New Field'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <FieldForm
              onSubmit={handleSubmitField}
              editingField={editingField}
              fieldTypes={fieldTypes}
              onCancel={handleCloseModal}
            />
          </div>
        </div>
      )}
    </div>
  );
} 
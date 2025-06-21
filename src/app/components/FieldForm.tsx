"use client";
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface FieldType {
  value: string;
  label: string;
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
  options?: string;
}

interface FieldFormProps {
  onSubmit: (data: any) => void;
  editingField: BookingFormField | null;
  fieldTypes: FieldType[];
  onCancel: () => void;
}

export default function FieldForm({ onSubmit, editingField, fieldTypes, onCancel }: FieldFormProps) {
  const [showOptions, setShowOptions] = useState(editingField?.type === 'select');

  const { register, handleSubmit, watch, reset } = useForm<FormData>({
    defaultValues: editingField ? {
      ...editingField,
      options: editingField.options?.join(', ')
    } : {
      type: 'text',
      required: false,
      readonly: false
    }
  });

  useEffect(() => {
    if (editingField) {
      reset({
        ...editingField,
        options: editingField.options?.join(', ')
      });
    }
  }, [editingField, reset]);

  const selectedType = watch('type');

  const handleTypeChange = (type: string) => {
    setShowOptions(type === 'select');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Label</label>
          <input
            type="text"
            {...register("label", { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Enter field label"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Field Name</label>
          <input
            type="text"
            {...register("name", { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Enter field name"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Field Type</label>
        <select
          {...register("type")}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          {fieldTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            {...register("required")}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="ml-2 text-sm text-gray-700">Required</label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            {...register("readonly")}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="ml-2 text-sm text-gray-700">Read Only</label>
        </div>
      </div>

      {showOptions && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Options (comma-separated)
          </label>
          <input
            type="text"
            {...register("options")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Option 1, Option 2, Option 3"
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter options separated by commas
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {editingField ? 'Update Field' : 'Add Field'}
        </button>
      </div>
    </form>
  );
} 
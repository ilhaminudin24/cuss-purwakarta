import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface ServiceConfig {
  id: string;
  serviceName: string;
  showPickup: boolean;
  showDestination: boolean;
  showDirections: boolean;
  firstStepFields: string[];
  secondStepFields: string[];
}

interface BookingFormField {
  id: string;
  label: string;
  name: string;
  type: string;
}

export default function ServiceConfigAdmin() {
  const [configs, setConfigs] = useState<ServiceConfig[]>([]);
  const [fields, setFields] = useState<BookingFormField[]>([]);
  const [editingConfig, setEditingConfig] = useState<ServiceConfig | null>(null);
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  const services = ['Ojek', 'Barang', 'Rental'];

  useEffect(() => {
    fetchConfigs();
    fetchFields();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/admin/service-config');
      if (!response.ok) throw new Error('Failed to fetch configs');
      const data = await response.json();
      setConfigs(data);
    } catch (error) {
      console.error('Error fetching configs:', error);
    }
  };

  const fetchFields = async () => {
    try {
      const response = await fetch('/api/admin/booking-form-fields');
      if (!response.ok) throw new Error('Failed to fetch fields');
      const data = await response.json();
      setFields(data);
    } catch (error) {
      console.error('Error fetching fields:', error);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const configData = {
        ...data,
        firstStepFields: data.firstStepFields ? data.firstStepFields.split(',').map((f: string) => f.trim()) : [],
        secondStepFields: data.secondStepFields ? data.secondStepFields.split(',').map((f: string) => f.trim()) : [],
        showPickup: data.showPickup === 'true',
        showDestination: data.showDestination === 'true',
        showDirections: data.showDirections === 'true',
      };

      const url = editingConfig
        ? `/api/admin/service-config/${editingConfig.id}`
        : '/api/admin/service-config';
      const method = editingConfig ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData),
      });

      if (!response.ok) throw new Error('Failed to save config');

      await fetchConfigs();
      setEditingConfig(null);
      reset();
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  const editConfig = (config: ServiceConfig) => {
    setEditingConfig(config);
    Object.entries(config).forEach(([key, value]) => {
      if (key === 'firstStepFields' || key === 'secondStepFields') {
        setValue(key, (value as string[]).join(', '));
      } else {
        setValue(key, value);
      }
    });
  };

  const deleteConfig = async (id: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return;

    try {
      const response = await fetch(`/api/admin/service-config/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete config');

      await fetchConfigs();
    } catch (error) {
      console.error('Error deleting config:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Service Configuration</h1>

      {/* Configuration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Service</label>
            <select {...register('serviceName')} className="w-full p-2 border rounded">
              <option value="">Select Service</option>
              {services.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2">Show Pickup</label>
            <select {...register('showPickup')} className="w-full p-2 border rounded">
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <label className="block mb-2">Show Destination</label>
            <select {...register('showDestination')} className="w-full p-2 border rounded">
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <label className="block mb-2">Show Directions</label>
            <select {...register('showDirections')} className="w-full p-2 border rounded">
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block mb-2">First Step Fields (comma-separated field names)</label>
            <input {...register('firstStepFields')} className="w-full p-2 border rounded" />
            <div className="mt-2 text-sm text-gray-600">
              Available fields: {fields.map(f => f.name).join(', ')}
            </div>
          </div>
          <div className="col-span-2">
            <label className="block mb-2">Second Step Fields (comma-separated field names)</label>
            <input {...register('secondStepFields')} className="w-full p-2 border rounded" />
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {editingConfig ? 'Update Configuration' : 'Add Configuration'}
        </button>
      </form>

      {/* Configurations List */}
      <div className="space-y-4">
        {configs.map(config => (
          <div
            key={config.id}
            className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
          >
            <div className="flex-grow">
              <h3 className="font-medium">{config.serviceName}</h3>
              <p className="text-sm text-gray-500">
                Pickup: {config.showPickup ? 'Yes' : 'No'} |
                Destination: {config.showDestination ? 'Yes' : 'No'} |
                Directions: {config.showDirections ? 'Yes' : 'No'}
              </p>
              <p className="text-sm text-gray-500">
                First Step: {config.firstStepFields.join(', ')}
              </p>
              <p className="text-sm text-gray-500">
                Second Step: {config.secondStepFields.join(', ')}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => editConfig(config)}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
              <button
                onClick={() => deleteConfig(config.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
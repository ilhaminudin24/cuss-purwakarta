import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import DirectionsField from './DirectionsField';
import MapField from './MapField';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

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

interface ServiceConfig {
  id: string;
  serviceName: string;
  showPickup: boolean;
  showDestination: boolean;
  showDirections: boolean;
  firstStepFields: string[];
  secondStepFields: string[];
}

interface FormData {
  [key: string]: any;
  name?: string;
  service?: string;
  pickup?: { lat: number; lng: number; address: string };
  destination?: { lat: number; lng: number; address: string };
  distance?: number;
  notes?: string;
  whatsapp?: string;
  subscription?: boolean;
  latitude?: number;
  longitude?: number;
}

interface MultiStepBookingFormProps {
  fields: BookingFormField[];
  configs: ServiceConfig[];
  selectedService: string | null;
  onServiceChange: (service: string | null) => void;
  onSubmit: (data: FormData) => void;
  onClose: () => void;
  initialData?: FormData;
}

export default function MultiStepBookingForm({ 
  fields, 
  configs, 
  selectedService, 
  onServiceChange,
  onSubmit, 
  onClose, 
  initialData 
}: MultiStepBookingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [gpsLocation, setGpsLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  
  const methods = useForm<FormData>({
    defaultValues: initialData || {},
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const { register, control, handleSubmit, watch, setValue, trigger } = methods;

  // Request GPS location when component mounts
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setGpsLocation({ latitude, longitude });
          setLocationPermission('granted');
          // Store GPS coordinates in form data
          setValue('latitude', latitude);
          setValue('longitude', longitude);
          console.log('GPS location captured:', { latitude, longitude });
        },
        (error) => {
          console.warn('GPS location access denied or failed:', error.message);
          setLocationPermission('denied');
          // Set GPS coordinates to undefined in form data
          setValue('latitude', undefined);
          setValue('longitude', undefined);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      console.warn('Geolocation is not supported by this browser');
      setLocationPermission('denied');
    }
  }, [setValue]);

  // Get the current service configuration
  const currentConfig = selectedService 
    ? configs.find(c => c.serviceName === selectedService)
    : null;

  // Live distance calculation
  const pickup = watch('pickup');
  const destination = watch('destination');
  useEffect(() => {
    if (pickup && destination && pickup.lat && pickup.lng && destination.lat && destination.lng) {
      const distance = calculateDistance(
        pickup.lat,
        pickup.lng,
        destination.lat,
        destination.lng
      );
      setValue('distance', distance);
    }
  }, [pickup, destination, setValue]);

  const renderField = (field: BookingFormField) => {
    // For map fields, show them in step 2
    if (field.type === 'map') {
      if (currentStep !== 2) return null;

      // Skip individual rendering of pickup/destination as we'll handle them together
      if (field.name === 'pickup' || field.name === 'destination') {
        return null;
      }

      // If we have a service selected and a config, only show fields in secondStepFields
      if (currentConfig && !currentConfig.secondStepFields.includes(field.name)) {
        return null;
      }

      return (
        <MapField
          key={field.id}
          name={field.name}
          control={control}
          label={field.label}
          required={field.required}
          readonly={field.readonly}
        />
      );
    }

    // For non-map fields, show them in step 1
    if (currentStep !== 1) return null;

    // If we have a service selected and a config, only show fields in firstStepFields
    if (currentConfig && !currentConfig.firstStepFields.includes(field.name)) {
      return null;
    }

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <div key={field.id} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              {...register(field.name)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              {...register(field.name)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              onChange={(e) => {
                if (field.name === 'service') {
                  onServiceChange(e.target.value);
                }
              }}
            >
              <option value="">Select {field.label.toLowerCase()}</option>
              {field.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="relative flex items-start">
            <div className="flex h-5 items-center">
              <input
                type="checkbox"
                {...register(field.name)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label className="font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              {...register(field.name)}
              rows={4}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const renderMapSection = () => {
    if (currentStep !== 2) return null;

    // If we have a service selected and a config, check if we should show the map
    if (currentConfig) {
      if (!currentConfig.showPickup && !currentConfig.showDestination) {
        return null;
      }
    }

    const pickupField = fields.find(f => f.name === 'pickup');
    const destinationField = fields.find(f => f.name === 'destination');

    if (!pickupField || !destinationField) return null;

    return (
      <DirectionsField
        pickupValue={watch('pickup')}
        destinationValue={watch('destination')}
        onPickupChange={(value) => setValue('pickup', value)}
        onDestinationChange={(value) => setValue('destination', value)}
        showPickup={currentConfig?.showPickup ?? true}
        showDestination={currentConfig?.showDestination ?? true}
        showDirections={currentConfig?.showDirections ?? true}
      />
    );
  };

  const renderSummarySection = () => {
    if (currentStep !== 3) return null;

    const formData = watch();
    const readOnlyFields = fields.filter(field => field.readonly);
    const distanceField = fields.find(field => field.name === 'distance');

    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please review your order details before submitting
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6">
              {readOnlyFields.map(field => (
                <div key={field.id} className="sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">{field.label}</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                    {field.type === 'select' ? (
                      field.options?.find(opt => opt === formData[field.name]) || formData[field.name]
                    ) : field.type === 'checkbox' ? (
                      formData[field.name] ? 'Yes' : 'No'
                    ) : field.type === 'map' ? (
                      formData[field.name]?.address || 'Not set'
                    ) : field.type === 'number' && field.name === 'distance' ? (
                      formData[field.name] ? `${Number(formData[field.name]).toFixed(2)} km` : 'Calculating...'
                    ) : (
                      formData[field.name] || '-'
                    )}
                  </dd>
                </div>
              ))}

              {/* Show distance even if it's not in readOnlyFields */}
              {!readOnlyFields.some(f => f.name === 'distance') && formData.pickup && formData.destination && (
                <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Distance</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                    {formData.distance ? `${Number(formData.distance).toFixed(2)} km` : 'Calculating...'}
                  </dd>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleNext = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Validate current step
    const isValid = await trigger();
    if (!isValid) return;

    // If we're on step 1 and no service is selected, don't proceed
    if (currentStep === 1 && !selectedService) {
      alert('Please select a service to continue');
      return;
    }

    // If we're on step 2 and map fields are required but not filled
    if (currentStep === 2) {
      const config = configs.find(c => c.serviceName === selectedService);
      if (config) {
        if (config.showPickup && !watch('pickup')) {
          alert('Please select a pickup location');
          return;
        }
        if (config.showDestination && !watch('destination')) {
          alert('Please select a destination');
          return;
        }
      }
    }

    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFormSubmit = async (data: FormData) => {
    // Final validation before submission
    const isValid = await trigger();
    if (!isValid) return;

    // Create a clean data object with required fields
    const cleanData: Record<string, any> = {
      name: data.name || 'Anonymous',
      whatsapp: data.whatsapp || null,
      service: data.service || 'Unknown',
      pickup: data.pickup || { lat: 0, lng: 0, address: '' },
      destination: data.destination || { lat: 0, lng: 0, address: '' },
      distance: 0,
      subscription: Boolean(data.subscription),
      notes: data.notes || undefined,
      latitude: data.latitude || undefined,
      longitude: data.longitude || undefined,
    };

    // If we have pickup and destination, calculate final distance
    if (data.pickup && data.destination && 
        typeof data.pickup.lat === 'number' && 
        typeof data.pickup.lng === 'number' && 
        typeof data.destination.lat === 'number' && 
        typeof data.destination.lng === 'number') {
      const distance = calculateDistance(
        data.pickup.lat,
        data.pickup.lng,
        data.destination.lat,
        data.destination.lng
      );
      cleanData.distance = distance;
    }

    // Add any additional fields from the form that aren't part of the base structure
    fields.forEach(field => {
      if (!(field.name in cleanData) && data[field.name] !== undefined) {
        cleanData[field.name] = data[field.name];
      }
    });

    console.log('Submitting form data:', cleanData);
    onSubmit(cleanData as FormData);
  };

  // Helper function to calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return 'Formulir Pesanan';
      case 2:
        return 'Pilih Lokasi';
      case 3:
        return 'Konfirmasi Pesanan';
      default:
        return '';
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{getStepTitle(currentStep)}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-y-auto">
            <div className="px-6 py-4">
              {/* Progress Steps */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex-1 relative">
                      <div className={`h-2 ${
                        step <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
                      } ${step === 1 ? 'rounded-l-full' : ''} ${
                        step === 3 ? 'rounded-r-full' : ''
                      }`}></div>
                      <div className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm ${
                        step <= currentStep ? 'text-blue-500 font-medium' : 'text-gray-500'
                      }`}>
                        {step === 1 ? 'Details' : step === 2 ? 'Location' : 'Summary'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {fields.map(renderField)}
                {renderMapSection()}
                {renderSummarySection()}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FaArrowLeft className="mr-2 -ml-1 h-4 w-4" />
                    Back
                  </button>
                )}
                <div className="flex-1 flex justify-end">
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Next
                      <FaArrowRight className="ml-2 -mr-1 h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Submit Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </FormProvider>
  );
} 
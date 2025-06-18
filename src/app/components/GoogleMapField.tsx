import React, { useCallback, useEffect, useRef, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import { MapValue } from "../types/map";

// Use the environment variable
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Add some debug logging in development
if (process.env.NODE_ENV === 'development' && !GOOGLE_MAPS_API_KEY) {
  console.warn('Google Maps API key is missing. Please check your .env.local file.');
}

const PURWAKARTA_CENTER = { lat: -6.5567, lng: 107.4439 };
const DEFAULT_ZOOM = 14;

const PURWAKARTA_BOUNDS = {
  north: -6.4,
  south: -6.7,
  east: 107.6,
  west: 107.2,
};

const autocompleteOptions = {
  componentRestrictions: { country: "id" },
  bounds: PURWAKARTA_BOUNDS,
  strictBounds: true,
};

interface GoogleMapFieldProps {
  value?: MapValue;
  onChange?: (value: MapValue) => void;
}

export default function GoogleMapField({ value, onChange }: GoogleMapFieldProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places"]
  });
  const [marker, setMarker] = useState<{ lat: number; lng: number }>(value ? { lat: value.lat, lng: value.lng } : PURWAKARTA_CENTER);
  const [address, setAddress] = useState(value?.address || "");
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (value && (value.lat !== marker.lat || value.lng !== marker.lng)) {
      setMarker({ lat: value.lat, lng: value.lng });
      setAddress(value.address || "");
    }
  }, [value, marker.lat, marker.lng]);

  // Reverse geocode when marker changes
  const fetchAddress = useCallback((lat: number, lng: number) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        setAddress(results[0].formatted_address);
        onChange?.({ lat, lng, address: results[0].formatted_address });
      } else {
        setAddress("");
        onChange?.({ lat, lng, address: "" });
      }
    });
  }, [onChange]);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarker({ lat, lng });
      fetchAddress(lat, lng);
    }
  };

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarker({ lat, lng });
      fetchAddress(lat, lng);
    }
  };

  const onLoadAutocomplete = (ac: google.maps.places.Autocomplete) => {
    setAutocomplete(ac);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMarker({ lat, lng });
        fetchAddress(lat, lng);
        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
        }
      }
    }
  };

  if (loadError) {
    console.error('Google Maps load error:', loadError);
    return (
      <div className="h-[400px] bg-red-50 rounded-lg flex items-center justify-center text-red-500 p-4">
        <div className="text-center">
          <p className="font-semibold">Error loading Google Maps</p>
          <p className="text-sm mt-2">Please check the API configuration.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) return <div className="h-[400px] bg-gray-100 rounded-lg animate-pulse" />;

  return (
    <div className="space-y-2">
      <Autocomplete
        onLoad={onLoadAutocomplete}
        onPlaceChanged={onPlaceChanged}
        options={autocompleteOptions}
      >
        <input
          type="text"
          placeholder="Cari alamat atau tempat..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Autocomplete>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "400px" }}
        center={marker}
        zoom={DEFAULT_ZOOM}
        onClick={handleMapClick}
        onLoad={map => { mapRef.current = map; }}
      >
        {/* User marker */}
        <Marker
          position={marker}
          draggable={true}
          onDragEnd={handleMarkerDragEnd}
        />
    
      </GoogleMap>
      <div className="text-sm text-gray-600">
        <p className="font-medium">Alamat terpilih:</p>
        <p>{address}</p>
      </div>
    </div>
  );
} 
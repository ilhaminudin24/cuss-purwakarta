import React, { useCallback, useEffect, useRef, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import { MapValue } from "../types/map";
import { FaMapMarkerAlt, FaSearch, FaTimes, FaLocationArrow } from "react-icons/fa";

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
  readonly?: boolean;
}

export default function GoogleMapField({ value, onChange, readonly = false }: GoogleMapFieldProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places"]
  });
  const [marker, setMarker] = useState<{ lat: number; lng: number }>(value ? { lat: value.lat, lng: value.lng } : PURWAKARTA_CENTER);
  const [address, setAddress] = useState(value?.address || "");
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value && (value.lat !== marker.lat || value.lng !== marker.lng)) {
      setMarker({ lat: value.lat, lng: value.lng });
      setAddress(value.address || "");
    }
  }, [value, marker.lat, marker.lng]);

  const fetchAddress = useCallback((lat: number, lng: number) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        setAddress(results[0].formatted_address);
        setSearchInput(results[0].formatted_address);
        onChange?.({ lat, lng, address: results[0].formatted_address });
      } else {
        setAddress("");
        setSearchInput("");
        onChange?.({ lat, lng, address: "" });
      }
    });
  }, [onChange]);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (readonly) return;
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarker({ lat, lng });
      fetchAddress(lat, lng);
    }
  };

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (readonly) return;
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
    if (readonly) return;
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMarker({ lat, lng });
        setAddress(place.formatted_address || "");
        setSearchInput(place.formatted_address || "");
        onChange?.({ lat, lng, address: place.formatted_address || "" });
        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
          mapRef.current.setZoom(16);
        }
      }
    }
  };

  const handleUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMarker({ lat, lng });
          fetchAddress(lat, lng);
          if (mapRef.current) {
            mapRef.current.panTo({ lat, lng });
            mapRef.current.setZoom(16);
          }
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  };

  const clearSearch = () => {
    setSearchInput("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
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
      {!readonly && (
        <div className="relative">
          <div className={`flex items-center p-2 bg-white rounded-lg shadow-sm border ${isSearchFocused ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'}`}>
            <FaSearch className="text-gray-400 mr-2" />
            <Autocomplete
              onLoad={onLoadAutocomplete}
              onPlaceChanged={onPlaceChanged}
              options={autocompleteOptions}
            >
              <input
                ref={searchInputRef}
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Cari alamat atau tempat..."
                className="w-full outline-none text-gray-700"
              />
            </Autocomplete>
            {searchInput && (
              <button
                onClick={clearSearch}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <FaTimes className="text-gray-400" />
              </button>
            )}
            <button
              onClick={handleUserLocation}
              className="ml-2 p-2 hover:bg-gray-100 rounded-full text-blue-500"
              title="Use current location"
            >
              <FaLocationArrow />
            </button>
          </div>
        </div>
      )}
      <div className="relative rounded-lg overflow-hidden shadow-md">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "400px" }}
          center={marker}
          zoom={DEFAULT_ZOOM}
          onClick={handleMapClick}
          onLoad={map => { mapRef.current = map; }}
          options={{
            gestureHandling: readonly ? "cooperative" : "auto",
            streetViewControl: !readonly,
            mapTypeControl: !readonly,
            zoomControl: !readonly,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          }}
        >
          <Marker
            position={marker}
            draggable={!readonly}
            onDragEnd={handleMarkerDragEnd}
            animation={google.maps.Animation.DROP}
          />
        </GoogleMap>
      </div>
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-start">
          <FaMapMarkerAlt className="text-red-500 mt-1 mr-2 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-700">Alamat terpilih:</p>
            <p className="text-gray-600 text-sm mt-1">{address || "Belum dipilih"}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 
import React, { useCallback, useEffect, useRef, useState } from "react";
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader, Autocomplete, Libraries } from "@react-google-maps/api";
import { MapValue } from "../types/map";
import { FaMapMarkerAlt, FaSearch, FaTimes, FaLocationArrow, FaExchangeAlt } from "react-icons/fa";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

const PURWAKARTA_CENTER = { lat: -6.5567, lng: 107.4439 };
const DEFAULT_ZOOM = 14;

const PURWAKARTA_BOUNDS = {
  north: -6.4,
  south: -6.7,
  east: 107.6,
  west: 107.2,
};

const libraries: Libraries = ["places", "geometry"];

const autocompleteOptions = {
  componentRestrictions: { country: "id" },
  bounds: PURWAKARTA_BOUNDS,
  strictBounds: true,
};

interface DirectionsFieldProps {
  pickupValue?: MapValue;
  destinationValue?: MapValue;
  onPickupChange?: (value: MapValue) => void;
  onDestinationChange?: (value: MapValue) => void;
  readonly?: boolean;
  showPickup?: boolean;
  showDestination?: boolean;
  showDirections?: boolean;
}

export default function DirectionsField({
  pickupValue,
  destinationValue,
  onPickupChange,
  onDestinationChange,
  readonly = false,
  showPickup = true,
  showDestination = true,
  showDirections = true,
}: DirectionsFieldProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries
  });

  const [pickupInput, setPickupInput] = useState(pickupValue?.address || "");
  const [destinationInput, setDestinationInput] = useState(destinationValue?.address || "");
  const [activeField, setActiveField] = useState<"pickup" | "destination" | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [directionsError, setDirectionsError] = useState<string | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);
  const pickupAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destinationAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoaded && !directionsService) {
      setDirectionsService(new window.google.maps.DirectionsService());
    }
  }, [isLoaded, directionsService]);

  const updateDirections = useCallback(async () => {
    if (!showDirections || !pickupValue || !destinationValue || !directionsService || !isLoaded) return;

    try {
      const result = await directionsService.route({
        origin: { lat: pickupValue.lat, lng: pickupValue.lng },
        destination: { lat: destinationValue.lat, lng: destinationValue.lng },
        travelMode: google.maps.TravelMode.DRIVING,
      });
      setDirections(result);
      setDirectionsError(null);
    } catch (error) {
      console.error('Error fetching directions:', error);
      setDirectionsError('Could not calculate route');
      setDirections(null);
    }
  }, [pickupValue, destinationValue, directionsService, isLoaded, showDirections]);

  useEffect(() => {
    updateDirections();
  }, [pickupValue, destinationValue, updateDirections]);

  const handlePlaceSelect = (type: "pickup" | "destination") => {
    const autocomplete = type === "pickup" ? pickupAutocompleteRef.current : destinationAutocompleteRef.current;
    if (!autocomplete) return;

    const place = autocomplete.getPlace();
    if (!place.geometry || !place.geometry.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const address = place.formatted_address || "";

    if (type === "pickup" && showPickup) {
      setPickupInput(address);
      onPickupChange?.({ lat, lng, address });
    } else if (type === "destination" && showDestination) {
      setDestinationInput(address);
      onDestinationChange?.({ lat, lng, address });
    }
  };

  const handleUserLocation = async (type: "pickup" | "destination") => {
    if (!navigator.geolocation) return;

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ location: { lat, lng } });

      if (result.results[0]) {
        const address = result.results[0].formatted_address;
        if (type === "pickup" && showPickup) {
          setPickupInput(address);
          onPickupChange?.({ lat, lng, address });
        } else if (type === "destination" && showDestination) {
          setDestinationInput(address);
          onDestinationChange?.({ lat, lng, address });
        }
      }
    } catch (error) {
      console.error('Error getting user location:', error);
    }
  };

  const swapLocations = () => {
    if (!showPickup || !showDestination || !pickupValue || !destinationValue) return;
    
    const tempPickup = { ...pickupValue };
    onPickupChange?.(destinationValue);
    onDestinationChange?.(tempPickup);
    setPickupInput(destinationValue.address);
    setDestinationInput(pickupValue.address);
  };

  const clearField = (type: "pickup" | "destination") => {
    if (type === "pickup" && showPickup) {
      setPickupInput("");
      onPickupChange?.({ lat: 0, lng: 0, address: "" });
      if (pickupInputRef.current) {
        pickupInputRef.current.focus();
      }
    } else if (type === "destination" && showDestination) {
      setDestinationInput("");
      onDestinationChange?.({ lat: 0, lng: 0, address: "" });
      if (destinationInputRef.current) {
        destinationInputRef.current.focus();
      }
    }
  };

  if (loadError) {
    return (
      <div className="h-[500px] bg-red-50 rounded-lg flex items-center justify-center text-red-500 p-4">
        <div className="text-center">
          <p className="font-semibold">Error loading Google Maps</p>
          <p className="text-sm mt-2">Please check the API configuration.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) return <div className="h-[500px] bg-gray-100 rounded-lg animate-pulse" />;

  return (
    <div className="space-y-2">
      {!readonly && (
        <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
          {showPickup && (
            <div className="relative">
              <div className={`flex items-center p-2 bg-white rounded-lg border ${activeField === "pickup" ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'}`}>
                <FaMapMarkerAlt className="text-green-600 mr-2" />
                <Autocomplete
                  onLoad={(auto) => { pickupAutocompleteRef.current = auto; }}
                  onPlaceChanged={() => handlePlaceSelect("pickup")}
                  options={autocompleteOptions}
                >
                  <input
                    ref={pickupInputRef}
                    type="text"
                    value={pickupInput}
                    onChange={(e) => setPickupInput(e.target.value)}
                    onFocus={() => setActiveField("pickup")}
                    onBlur={() => setActiveField(null)}
                    placeholder="Pilih lokasi jemput"
                    className="w-full outline-none text-gray-700"
                  />
                </Autocomplete>
                {pickupInput && (
                  <button
                    onClick={() => clearField("pickup")}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <FaTimes className="text-gray-400" />
                  </button>
                )}
                <button
                  onClick={() => handleUserLocation("pickup")}
                  className="ml-2 p-2 hover:bg-gray-100 rounded-full text-blue-500"
                  title="Use current location"
                >
                  <FaLocationArrow />
                </button>
              </div>
            </div>
          )}

          {showPickup && showDestination && (
            <div className="flex justify-center">
              <button
                onClick={swapLocations}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transform transition-transform hover:scale-110"
                title="Swap locations"
              >
                <FaExchangeAlt className="transform rotate-90" />
              </button>
            </div>
          )}

          {showDestination && (
            <div className="relative">
              <div className={`flex items-center p-2 bg-white rounded-lg border ${activeField === "destination" ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'}`}>
                <FaMapMarkerAlt className="text-red-600 mr-2" />
                <Autocomplete
                  onLoad={(auto) => { destinationAutocompleteRef.current = auto; }}
                  onPlaceChanged={() => handlePlaceSelect("destination")}
                  options={autocompleteOptions}
                >
                  <input
                    ref={destinationInputRef}
                    type="text"
                    value={destinationInput}
                    onChange={(e) => setDestinationInput(e.target.value)}
                    onFocus={() => setActiveField("destination")}
                    onBlur={() => setActiveField(null)}
                    placeholder="Pilih tujuan"
                    className="w-full outline-none text-gray-700"
                  />
                </Autocomplete>
                {destinationInput && (
                  <button
                    onClick={() => clearField("destination")}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <FaTimes className="text-gray-400" />
                  </button>
                )}
                <button
                  onClick={() => handleUserLocation("destination")}
                  className="ml-2 p-2 hover:bg-gray-100 rounded-full text-blue-500"
                  title="Use current location"
                >
                  <FaLocationArrow />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="relative rounded-lg overflow-hidden shadow-md">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "400px" }}
          center={pickupValue ? { lat: pickupValue.lat, lng: pickupValue.lng } : PURWAKARTA_CENTER}
          zoom={DEFAULT_ZOOM}
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
          {showDirections && directions ? (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: false,
                polylineOptions: {
                  strokeColor: "#4A90E2",
                  strokeWeight: 6,
                }
              }}
            />
          ) : (
            <>
              {showPickup && pickupValue && (
                <Marker
                  position={{ lat: pickupValue.lat, lng: pickupValue.lng }}
                  icon={{
                    url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                  }}
                />
              )}
              {showDestination && destinationValue && (
                <Marker
                  position={{ lat: destinationValue.lat, lng: destinationValue.lng }}
                  icon={{
                    url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                  }}
                />
              )}
            </>
          )}
        </GoogleMap>
      </div>

      {directionsError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {directionsError}
        </div>
      )}

      {showDirections && directions?.routes[0]?.legs[0] && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Estimasi Perjalanan:</p>
              <p className="text-gray-600 text-sm mt-1">
                {directions.routes[0].legs[0].duration?.text || ""}
                {" · "}
                {directions.routes[0].legs[0].distance?.text || ""}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
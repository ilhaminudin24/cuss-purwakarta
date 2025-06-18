"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { LatLngExpression } from "leaflet";
import MapSearch from "./MapSearch";
import { MapComponentProps, MapValue } from "../types/map";
import L from "leaflet";

// Set default marker icon paths for Leaflet
if (typeof window !== "undefined") {
  L.Icon.Default.mergeOptions({
    iconUrl: "/images/marker-icon.png",
    iconRetinaUrl: "/images/marker-icon-2x.png",
    shadowUrl: "/images/marker-shadow.png",
  });
}

// Dynamically import the map components
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

const PURWAKARTA_BOUNDS = {
  minLat: -6.7,
  maxLat: -6.3,
  minLon: 107.2,
  maxLon: 107.6,
};

const PURWAKARTA_CENTER = [-6.5567, 107.4439];
const DEFAULT_ZOOM = 14;

// Example static markers for Purwakarta
const STATIC_MARKERS = [
  {
    lat: -6.5567,
    lng: 107.4439,
    name: "Purwakarta City Mall",
    address: "Jl. Veteran No.1, Purwakarta"
  },
  {
    lat: -6.5605,
    lng: 107.4472,
    name: "Rumah Sakit Siloam",
    address: "Jl. Siloam No.2, Purwakarta"
  },
  {
    lat: -6.5642,
    lng: 107.4521,
    name: "Perumahan Griya Asri",
    address: "Jl. Griya Asri, Purwakarta"
  }
];

interface OverpassPlace {
  id: string;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: {
    name?: string;
    amenity?: string;
    shop?: string;
    landuse?: string;
  };
}

export default function MapComponent({
  value,
  onChange,
  height = "400px",
}: MapComponentProps) {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<LatLngExpression>([
    value?.lat || -6.2088,
    value?.lng || 107.6329,
  ]);
  const [address, setAddress] = useState(value?.address || "");
  const [overpassPlaces, setOverpassPlaces] = useState<OverpassPlace[]>([]);

  useEffect(() => {
    setMounted(true);

    // Overpass QL query for malls, hospitals, and residential areas in Purwakarta
    const query = `
      [out:json][timeout:25];
      (
        node["shop"="mall"](${PURWAKARTA_BOUNDS.minLon},${PURWAKARTA_BOUNDS.minLat},${PURWAKARTA_BOUNDS.maxLon},${PURWAKARTA_BOUNDS.maxLat});
        way["shop"="mall"](${PURWAKARTA_BOUNDS.minLon},${PURWAKARTA_BOUNDS.minLat},${PURWAKARTA_BOUNDS.maxLon},${PURWAKARTA_BOUNDS.maxLat});
        node["amenity"="hospital"](${PURWAKARTA_BOUNDS.minLon},${PURWAKARTA_BOUNDS.minLat},${PURWAKARTA_BOUNDS.maxLon},${PURWAKARTA_BOUNDS.maxLat});
        way["amenity"="hospital"](${PURWAKARTA_BOUNDS.minLon},${PURWAKARTA_BOUNDS.minLat},${PURWAKARTA_BOUNDS.maxLon},${PURWAKARTA_BOUNDS.maxLat});
        node["landuse"="residential"](${PURWAKARTA_BOUNDS.minLon},${PURWAKARTA_BOUNDS.minLat},${PURWAKARTA_BOUNDS.maxLon},${PURWAKARTA_BOUNDS.maxLat});
        way["landuse"="residential"](${PURWAKARTA_BOUNDS.minLon},${PURWAKARTA_BOUNDS.minLat},${PURWAKARTA_BOUNDS.maxLon},${PURWAKARTA_BOUNDS.maxLat});
      );
      out center;
    `;
    fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
      headers: { "Content-Type": "text/plain" },
    })
      .then((res) => res.json())
      .then((data) => {
        setOverpassPlaces(data.elements || []);
      })
      .catch(() => setOverpassPlaces([]));
  }, []);

  const handleMarkerDragEnd = async (e: any) => {
    const newPosition = e.target.getLatLng();
    setPosition([newPosition.lat, newPosition.lng]);

    try {
      // Reverse geocode to get address
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPosition.lat}&lon=${newPosition.lng}&accept-language=id`
      );
      const data = await response.json();
      const newAddress = data.display_name;
      setAddress(newAddress);
      onChange?.({ lat: newPosition.lat, lng: newPosition.lng, address: newAddress });
    } catch (error) {
      console.error("Error getting address:", error);
    }
  };

  const handleSearchSelect = (lat: number, lng: number, newAddress: string) => {
    setPosition([lat, lng]);
    setAddress(newAddress);
    onChange?.({ lat, lng, address: newAddress });
  };

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <MapSearch onSelect={handleSearchSelect} />
      <div
        style={{ height }}
        className="relative rounded-lg overflow-hidden border border-gray-300"
      >
        <MapContainer
          center={PURWAKARTA_CENTER as LatLngExpression}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a>'
            url="https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=N08vSoPQ2ZKluSBZlGVM"
          />
          <Marker
            position={position as LatLngExpression}
            draggable={true}
            eventHandlers={{
              dragend: handleMarkerDragEnd,
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-medium">Alamat:</p>
                <p>{address}</p>
                <p className="mt-2 text-gray-600">
                  Geser marker untuk mengubah lokasi
                </p>
              </div>
            </Popup>
          </Marker>
          {STATIC_MARKERS.map((place, idx) => (
            <Marker
              key={idx}
              position={[place.lat, place.lng]}
              icon={L.icon({
                iconUrl: "/images/marker-icon.png",
                iconRetinaUrl: "/images/marker-icon-2x.png",
                shadowUrl: "/images/marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
              })}
            >
              <Popup>
                <div>
                  <strong>{place.name}</strong>
                  <div>{place.address}</div>
                </div>
              </Popup>
            </Marker>
          ))}
          {overpassPlaces.map((place) => {
            const lat = place.lat || (place.center && place.center.lat);
            const lon = place.lon || (place.center && place.center.lon);
            if (!lat || !lon) return null;
            return (
              <Marker
                key={place.id}
                position={[lat, lon]}
                icon={L.icon({
                  iconUrl: "/images/marker-icon.png",
                  iconRetinaUrl: "/images/marker-icon-2x.png",
                  shadowUrl: "/images/marker-shadow.png",
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowSize: [41, 41],
                })}
              >
                <Popup>
                  <div>
                    <strong>{place.tags && (place.tags.name || place.tags.amenity || place.tags.shop || place.tags.landuse)}</strong>
                    {place.tags && place.tags.name && <div>{place.tags.name}</div>}
                    {place.tags && place.tags.amenity && <div>{place.tags.amenity}</div>}
                    {place.tags && place.tags.shop && <div>{place.tags.shop}</div>}
                    {place.tags && place.tags.landuse && <div>{place.tags.landuse}</div>}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
      {address && (
        <div className="text-sm text-gray-600">
          <p className="font-medium">Alamat terpilih:</p>
          <p>{address}</p>
        </div>
      )}
    </div>
  );
} 
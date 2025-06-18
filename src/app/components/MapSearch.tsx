"use client";
import { useState, useCallback, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { FaSearch, FaSpinner } from "react-icons/fa";
import { MapSearchProps } from "../types/map";

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

// Purwakarta City bounding box
const PURWAKARTA_BOUNDS = {
  minLat: -6.7,
  maxLat: -6.3,
  minLon: 107.2,
  maxLon: 107.6,
};

export default function MapSearch({ onSelect }: MapSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery] = useDebounce(query, 500);

  const searchAddress = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // Add Purwakarta to the search query to prioritize results in Purwakarta
      const searchWithCity = `${searchQuery}, Purwakarta`;
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(searchWithCity)}`
      );
      const data = await response.json();
      console.log("Raw API response:", data); // Log the raw API response
      
      setResults(data);
    } catch (error) {
      console.error("Error searching address:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Automatically trigger search when debouncedQuery changes
  useEffect(() => {
    if (debouncedQuery) {
      searchAddress(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery, searchAddress]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari alamat di Purwakarta..."
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => searchAddress(query)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
        </button>
      </div>
      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          {results.map((result) => (
            <button
              key={`${result.lat}-${result.lon}`}
              onClick={() => {
                onSelect(
                  parseFloat(result.lat),
                  parseFloat(result.lon),
                  result.display_name
                );
                setQuery(result.display_name);
                setResults([]);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
            >
              {result.display_name}
            </button>
          ))}
        </div>
      )}
      {results.length === 0 && query && !loading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2 text-sm text-gray-500">
          Tidak ada hasil ditemukan di Purwakarta
        </div>
      )}
    </div>
  );
} 
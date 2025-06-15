"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import useSWR from "swr";

interface MenuItem {
  id: string;
  title: string;
  path: string;
  order: number;
  isVisible: boolean;
}

const fetcher = (url: string) => fetch(url, {
  cache: 'no-store',
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
}).then((res) => res.json());

export default function Navigation() {
  const pathname = usePathname();
  const { data: menuItems, error, isLoading, mutate } = useSWR<MenuItem[]>('/api/navigation', fetcher, {
    refreshInterval: 5000, // Refresh every 5 seconds
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 0, // Disable deduping
    keepPreviousData: false // Don't keep previous data
  });

  // Force a revalidation when the component mounts
  useEffect(() => {
    mutate();
  }, [mutate]);

  if (isLoading) {
    return (
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="animate-pulse h-8 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  if (error || !menuItems) {
    return (
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-orange-500">
                  CUSS Purwakarta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Filter out any menu items with invalid paths
  const validMenuItems = menuItems.filter(item => item.path && item.path.trim() !== '');

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-orange-500">
                CUSS Purwakarta
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {validMenuItems.map((item) => {
                // Ensure path starts with a forward slash
                const path = item.path.startsWith('/') ? item.path : `/${item.path}`;
                return (
                  <Link
                    key={item.id}
                    href={path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === path
                        ? "border-orange-500 text-orange-500"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 
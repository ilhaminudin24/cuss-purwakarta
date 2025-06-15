"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import useSWR from 'swr';

interface MenuItem {
  id: string;
  title: string;
  path: string;
  order: number;
  isVisible: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: menuItems, error, isLoading } = useSWR<MenuItem[]>('/api/navigation', fetcher, {
    refreshInterval: 5000, // Refresh every 5 seconds
  });

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  if (isLoading) {
    return (
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Loading...
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  if (error) {
    return (
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Error loading menu
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              CUSS Purwakarta
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            {menuItems?.map((item: MenuItem) => (
              <Link
                key={item.id}
                href={item.path}
                className={`${
                  pathname === item.path
                    ? "text-orange-500"
                    : "text-gray-500 hover:text-gray-900"
                } px-3 py-2 text-sm font-medium`}
              >
                {item.title}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {menuItems?.map((item: MenuItem) => (
              <Link
                key={item.id}
                href={item.path}
                className={`${
                  pathname === item.path
                    ? "bg-orange-50 border-orange-500 text-orange-700"
                    : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setIsOpen(false)}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
} 
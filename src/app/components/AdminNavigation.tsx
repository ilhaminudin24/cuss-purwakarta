"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { FaUser, FaSignOutAlt } from "react-icons/fa"; // Import icons

interface MenuItem {
  id: string;
  title: string;
  path: string;
  order: number;
  isVisible: boolean;
  menuType: string;
  group?: string;
}

const fetcher = (url: string) => fetch(url, {
  cache: 'no-store',
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
}).then((res) => res.json());

export default function AdminNavigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const { data: menuItems, error, isLoading } = useSWR<MenuItem[]>(
    '/api/admin/navigation', fetcher, {
      refreshInterval: 5000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 0,
      keepPreviousData: false
    }
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debug log to check menu items
  useEffect(() => {
    if (menuItems) {
      console.log('Menu Items:', menuItems);
    }
  }, [menuItems]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  if (isLoading) {
    return (
      <nav className="bg-indigo-900 shadow-sm">
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
      <nav className="bg-indigo-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/admin" className="text-xl font-bold text-white">
                  CUSS Admin
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const validMenuItems = menuItems.filter(item => item.path && item.path.trim() !== '' && item.menuType === 'admin');
  const dashboardItem = validMenuItems.find(item => item.path === '/admin' || item.path === 'admin');
  const configItems = validMenuItems.filter(item => item.path !== '/admin' && item.path !== 'admin');

  return (
    <nav className="bg-indigo-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Logo on the left */}
          <div className="flex items-center">
            <Link href="/admin" className="text-xl font-bold text-white">
              CUSS Admin
            </Link>
          </div>

          {/* Center menu */}
          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-center">
            <div className="hidden sm:flex sm:space-x-8">
              {/* Dashboard Link - Always show */}
              <Link
                href="/admin"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === '/admin'
                    ? "border-white text-white"
                    : "border-transparent text-indigo-200 hover:border-indigo-300 hover:text-white"
                }`}
              >
                Dashboard
              </Link>

              {/* Configuration Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    configItems.some(item => pathname === item.path)
                      ? "border-white text-white"
                      : "border-transparent text-indigo-200 hover:border-indigo-300 hover:text-white"
                  }`}
                >
                  Konfigurasi
                  <svg
                    className={`ml-2 h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {isDropdownOpen && (
                  <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      {configItems.map((item) => {
                        const path = item.path.startsWith('/') ? item.path : `/${item.path}`;
                        return (
                          <Link
                            key={item.id}
                            href={path}
                            className={`block px-4 py-2 text-sm ${
                              pathname === path
                                ? "bg-indigo-100 text-indigo-900"
                                : "text-gray-700 hover:bg-indigo-50"
                            }`}
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            {item.title}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User menu on the right */}
          <div className="flex items-center">
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center text-indigo-200 hover:text-white"
              >
                <FaUser className="h-5 w-5" />
                <span className="ml-2 text-sm font-medium">{session?.user?.name || session?.user?.email}</span>
                <svg
                  className={`ml-2 h-4 w-4 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User dropdown menu */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <div className="px-4 py-2 text-xs text-gray-500">
                      Logged in as
                      <div className="font-medium text-gray-900">{session?.user?.email}</div>
                    </div>
                    <div className="border-t border-gray-100"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center"
                    >
                      <FaSignOutAlt className="mr-2" />
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 
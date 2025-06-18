"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

export default function AdminNavigation() {
  const pathname = usePathname();
  const { data: menuItems, error, isLoading } = useSWR<MenuItem[]>(
    '/api/admin/navigation', fetcher, {
      refreshInterval: 5000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 0,
      keepPreviousData: false
    }
  );

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

  const validMenuItems = menuItems.filter(item => item.path && item.path.trim() !== '');

  return (
    <nav className="bg-indigo-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center h-16">
          {/* Logo on the left */}
          <div className="absolute left-0 flex items-center h-full">
            <Link href="/admin" className="text-xl font-bold text-white">
              CUSS Admin
            </Link>
          </div>
          {/* Centered menu */}
          <div className="flex-1 flex justify-center">
            <div className="hidden sm:flex sm:space-x-8">
              {/* Show all menu items as top-level */}
              {validMenuItems.map((item) => {
                const path = item.path.startsWith('/') ? item.path : `/${item.path}`;
                return (
                  <Link
                    key={item.id}
                    href={path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === path
                        ? "border-white text-white"
                        : "border-transparent text-indigo-200 hover:border-indigo-300 hover:text-white"
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
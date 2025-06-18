"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { FaUser, FaSignOutAlt } from "react-icons/fa";

interface NavigationMenu {
  id: string;
  title: string;
  path?: string | null;
  icon?: string | null;
  order: number;
  isVisible: boolean;
  menuType: string;
  parentId?: string | null;
  children?: NavigationMenu[];
}

export default function AdminNavigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuItems, setMenuItems] = useState<NavigationMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [retryTimeout, setRetryTimeout] = useState<NodeJS.Timeout | null>(null);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/navigation', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || `HTTP error! status: ${response.status}`;
        console.error('Navigation fetch error details:', errorData);
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Create a Set to track unique IDs
      const seenIds = new Set<string>();
      const uniqueData = data.filter((item: NavigationMenu) => {
        if (seenIds.has(item.id)) return false;
        seenIds.add(item.id);
        return true;
      });

      // Organize items into a hierarchy
      const parentItems: NavigationMenu[] = [];
      const childrenMap = new Map<string, NavigationMenu[]>();

      uniqueData.forEach((item: NavigationMenu) => {
        if (!item.parentId) {
          parentItems.push(item);
        } else {
          if (!childrenMap.has(item.parentId)) {
            childrenMap.set(item.parentId, []);
          }
          childrenMap.get(item.parentId)?.push(item);
        }
      });

      // Sort parent items by order
      parentItems.sort((a, b) => a.order - b.order);

      // Add sorted children to their parents
      parentItems.forEach((parent) => {
        const children = childrenMap.get(parent.id);
        if (children) {
          children.sort((a, b) => a.order - b.order);
          parent.children = children;
        }
      });

      setMenuItems(parentItems);
      setError(null);
      setRetryCount(0); // Reset retry count on success
      
      // Clear any existing retry timeout
      if (retryTimeout) {
        clearTimeout(retryTimeout);
        setRetryTimeout(null);
      }
    } catch (err) {
      console.error('Navigation fetch error:', err);
      setError(err instanceof Error ? err.message : "Failed to fetch navigation");
      
      // Implement exponential backoff for retries
      if (retryCount < 3) {
        const timeout = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        const timeoutId = setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, timeout);
        setRetryTimeout(timeoutId);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
    
    // Cleanup function to clear timeout
    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [retryCount]); // Re-fetch when retryCount changes

  const handleLogout = async () => {
    if (retryTimeout) {
      clearTimeout(retryTimeout);
    }
    await signOut({ callbackUrl: '/admin/login' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 space-y-4">
        <div className="text-red-500 bg-red-50 p-4 rounded-lg">
          <p className="font-medium">Error loading navigation</p>
          <p className="text-sm mt-1">{error}</p>
          {retryCount < 3 && (
            <p className="text-sm mt-2">Retrying automatically...</p>
          )}
        </div>
        <button
          onClick={() => {
            setRetryCount(0); // Reset retry count
            fetchMenuItems();
          }}
          className="w-full px-4 py-2 text-sm text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Retry Manually
        </button>
      </div>
    );
  }

  const renderMenuItem = (item: NavigationMenu) => {
    const IconComponent = item.icon ? (Icons[item.icon as keyof typeof Icons] as LucideIcon) : null;
    const isActive = item.path ? pathname === item.path : false;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        {item.path ? (
          <div className="px-2 mb-1">
            <Link
              href={item.path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "hover:bg-orange-100 text-gray-700"
              }`}
            >
              {IconComponent && <IconComponent className="shrink-0" size={20} />}
              <span className="truncate">{item.title}</span>
            </Link>
          </div>
        ) : (
          <div className="px-2 mb-2">
            <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
              {IconComponent && <IconComponent className="shrink-0" size={20} />}
              <span className="truncate">{item.title}</span>
            </div>
          </div>
        )}
        {hasChildren && (
          <div className="ml-4 border-l border-gray-200 pl-2 mb-2">
            {item.children?.map(renderMenuItem)}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">CUSS Admin</span>
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1">
          {menuItems.map(renderMenuItem)}
        </div>
      </div>

      {/* User Profile and Logout */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-full bg-gray-200">
            <FaUser className="text-gray-600 w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session?.user?.email}
            </p>
            <p className="text-xs text-gray-500 truncate">
              Administrator
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <FaSignOutAlt className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
} 
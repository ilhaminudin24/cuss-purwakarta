"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface MenuItem {
  id: string;
  title: string;
  path: string;
  order: number;
  isVisible: boolean;
}

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch("/api/navigation");
      if (!response.ok) throw new Error("Failed to fetch menu items");
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      // Fallback to default menu items if the API fails
      setMenuItems([
        { id: "1", title: "Beranda", path: "/", order: 1, isVisible: true },
        { id: "2", title: "Layanan", path: "/services", order: 2, isVisible: true },
        { id: "3", title: "Cara Pesan", path: "/how-to-order", order: 3, isVisible: true },
        { id: "4", title: "Testimoni", path: "/testimonials", order: 4, isVisible: true },
        { id: "5", title: "FAQ", path: "/faq", order: 5, isVisible: true },
        { id: "6", title: "Tentang", path: "/about", order: 6, isVisible: true },
        { id: "7", title: "Kontak", path: "/contact", order: 7, isVisible: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-30 bg-white border-b border-orange-100 flex items-center justify-between px-4 sm:px-8 py-2 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="CUSS Purwakarta Logo" width={120} height={120} priority />
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 text-base font-medium">
          {!isLoading && menuItems.map((item) => (
            <Link 
              key={item.id} 
              href={item.path} 
              className="text-black hover:text-orange-500 transition-colors"
            >
              {item.title}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-black hover:text-orange-500 focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-white pt-16">
          <div className="flex flex-col items-center gap-4 p-4">
            {!isLoading && menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.path}
                className="text-black hover:text-orange-500 transition-colors text-lg font-medium w-full text-center py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
} 
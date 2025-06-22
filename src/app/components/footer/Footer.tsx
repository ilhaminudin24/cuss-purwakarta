'use client';

import React, { useState, useEffect } from 'react';
import CompanyInfoSection from './CompanyInfoSection';
import QuickLinksSection from './QuickLinksSection';
import ServicesSection from './ServicesSection';
import ContactSection from './ContactSection';
import BottomBar from './BottomBar';

// Types
export interface FooterSection {
  id: string;
  title: string;
  content?: string;
  position: number;
  visible: boolean;
  sectionType: string;
  links: FooterLink[];
}

export interface FooterLink {
  id: string;
  title: string;
  url: string;
  position: number;
  visible: boolean;
  isExternal: boolean;
  sectionId: string;
}

export interface SocialMedia {
  id: string;
  platform: string;
  url: string;
  icon: string;
  visible: boolean;
  position: number;
}

export interface CompanyInfo {
  id: string;
  companyName: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  copyright?: string;
  isActive: boolean;
}

interface FooterData {
  sections: FooterSection[];
  socialMedia: SocialMedia[];
  companyInfo: CompanyInfo | null;
}

export default function Footer() {
  const [data, setData] = useState<FooterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/footer');
        if (!response.ok) {
          throw new Error('Failed to fetch footer data');
        }
        
        const footerData = await response.json();
        setData(footerData);
      } catch (err) {
        console.error('Error fetching footer data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch footer data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  if (isLoading) {
    return (
      <footer className="w-full bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-6 w-1/2 bg-gray-700 rounded" />
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-gray-700 rounded" />
                  <div className="h-4 w-1/2 bg-gray-700 rounded" />
                  <div className="h-4 w-2/3 bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    );
  }

  if (error) {
    return (
      <footer className="w-full bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <p className="text-red-400 mb-2">Gagal memuat data footer.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Silakan refresh halaman
            </button>
          </div>
        </div>
      </footer>
    );
  }

  if (!data) return null;

  const { sections, socialMedia, companyInfo } = data;

  // Filter and sort visible sections
  const visibleSections = sections
    .filter((section: FooterSection) => section.visible)
    .sort((a: FooterSection, b: FooterSection) => a.position - b.position);

  // Group sections by type
  const companyInfoSection = visibleSections.find((s: FooterSection) => s.sectionType === 'company-info');
  const quickLinksSection = visibleSections.find((s: FooterSection) => s.sectionType === 'quick-links');
  const servicesSection = visibleSections.find((s: FooterSection) => s.sectionType === 'services');
  const contactSection = visibleSections.find((s: FooterSection) => s.sectionType === 'contact');

  return (
    <footer className="w-full bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info Section */}
          {companyInfo && (
            <div className="lg:col-span-1">
              <CompanyInfoSection companyInfo={companyInfo} />
            </div>
          )}

          {/* Quick Links Section */}
          {quickLinksSection && (
            <div>
              <QuickLinksSection section={quickLinksSection} />
            </div>
          )}

          {/* Services Section */}
          {servicesSection && (
            <div>
              <ServicesSection section={servicesSection} />
            </div>
          )}

          {/* Contact Section */}
          {contactSection && (
            <div>
              <ContactSection section={contactSection} socialMedia={socialMedia} />
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <BottomBar companyInfo={companyInfo} socialMedia={socialMedia} />
      </div>
    </footer>
  );
} 
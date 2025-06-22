import React from 'react';
import { CompanyInfo } from './Footer';
import SocialMediaIcons from './SocialMediaIcons';
import { SocialMedia } from './Footer';

interface BottomBarProps {
  companyInfo: CompanyInfo | null;
  socialMedia: SocialMedia[];
  className?: string;
}

export default function BottomBar({ companyInfo, socialMedia, className = '' }: BottomBarProps) {
  const currentYear = new Date().getFullYear();
  const companyName = companyInfo?.companyName || 'CUSS Purwakarta';
  const copyright = companyInfo?.copyright || `© ${currentYear} ${companyName}. All rights reserved.`;

  return (
    <div className={`border-t border-gray-700 pt-6 ${className}`}>
      <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
        {/* Copyright Section */}
        <div className="text-sm text-gray-400 text-center lg:text-left">
          <p className="mb-2 lg:mb-0">{copyright}</p>
          
          {/* Additional Company Info */}
          {companyInfo && (
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-xs text-gray-500">
              {companyInfo.address && (
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {companyInfo.address}
                </span>
              )}
              {companyInfo.phone && (
                <a 
                  href={`tel:${companyInfo.phone}`}
                  className="flex items-center hover:text-gray-300 transition-colors duration-200"
                  aria-label={`Call ${companyName} at ${companyInfo.phone}`}
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {companyInfo.phone}
                </a>
              )}
              {companyInfo.email && (
                <a 
                  href={`mailto:${companyInfo.email}`}
                  className="flex items-center hover:text-gray-300 transition-colors duration-200"
                  aria-label={`Email ${companyName} at ${companyInfo.email}`}
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {companyInfo.email}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Social Media & Legal Links */}
        <div className="flex flex-col items-center lg:items-end space-y-4">
          {/* Social Media Icons */}
          <SocialMediaIcons socialMedia={socialMedia} />
          
          {/* Legal Links */}
          <div className="flex flex-wrap justify-center lg:justify-end items-center space-x-6 text-sm text-gray-400">
            <a 
              href="/privacy-policy" 
              className="hover:text-white transition-colors duration-200 hover:underline"
              aria-label="Privacy Policy"
            >
              Privacy Policy
            </a>
            <a 
              href="/terms-of-service" 
              className="hover:text-white transition-colors duration-200 hover:underline"
              aria-label="Terms of Service"
            >
              Terms of Service
            </a>
            <a 
              href="/cookie-policy" 
              className="hover:text-white transition-colors duration-200 hover:underline"
              aria-label="Cookie Policy"
            >
              Cookie Policy
            </a>
            <a 
              href="/sitemap" 
              className="hover:text-white transition-colors duration-200 hover:underline"
              aria-label="Sitemap"
            >
              Sitemap
            </a>
            <a 
              href="/contact" 
              className="hover:text-white transition-colors duration-200 hover:underline"
              aria-label="Contact Us"
            >
              Contact
            </a>
          </div>
        </div>
      </div>

      {/* Additional Info Bar */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <span>Made with ❤️ in Purwakarta</span>
            <span>•</span>
            <span>Powered by Next.js</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Version 1.0.0</span>
            <span>•</span>
            <span>Last updated: {new Date().toLocaleDateString('id-ID', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 
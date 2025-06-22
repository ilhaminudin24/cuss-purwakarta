import React from 'react';
import Image from 'next/image';
import { CompanyInfo } from './Footer';

interface CompanyInfoSectionProps {
  companyInfo: CompanyInfo;
}

export default function CompanyInfoSection({ companyInfo }: CompanyInfoSectionProps) {
  return (
    <div className="space-y-4">
      {/* Logo */}
      {companyInfo.logo && (
        <div className="transition-transform duration-300 hover:scale-105">
          <Image
            src={companyInfo.logo} 
            alt={`${companyInfo.companyName} logo`}
            width={150}
            height={48}
            className="w-auto object-contain"
          />
        </div>
      )}
      
      {/* Company Name */}
      <h2 className="text-lg font-bold text-white transition-colors duration-200 hover:text-blue-300">
        {companyInfo.companyName}
      </h2>
      
      {/* Description */}
      {companyInfo.description && (
        <p className="text-sm text-gray-300 leading-relaxed">
          {companyInfo.description}
        </p>
      )}
      
      {/* Contact Information */}
      <div className="space-y-2">
        {companyInfo.address && (
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm text-gray-400">{companyInfo.address}</p>
          </div>
        )}
        
        {companyInfo.phone && (
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <a 
              href={`tel:${companyInfo.phone}`}
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
              aria-label={`Call ${companyInfo.companyName} at ${companyInfo.phone}`}
            >
              {companyInfo.phone}
            </a>
          </div>
        )}
        
        {companyInfo.email && (
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <a 
              href={`mailto:${companyInfo.email}`}
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
              aria-label={`Email ${companyInfo.companyName} at ${companyInfo.email}`}
            >
              {companyInfo.email}
            </a>
          </div>
        )}
        
        {companyInfo.website && (
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0-9c-5 0-9 4-9 9" />
            </svg>
            <a 
              href={companyInfo.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200 underline"
              aria-label={`Visit ${companyInfo.companyName} website`}
            >
              Website
            </a>
          </div>
        )}
      </div>
    </div>
  );
} 
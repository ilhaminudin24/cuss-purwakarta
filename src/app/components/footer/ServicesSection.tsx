import React from 'react';
import { FooterSection } from './Footer';

interface ServicesSectionProps {
  section: FooterSection;
}

export default function ServicesSection({ section }: ServicesSectionProps) {
  const visibleLinks = section.links
    .filter(link => link.visible)
    .sort((a, b) => a.position - b.position);

  if (visibleLinks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Section Title */}
      <h3 className="text-md font-semibold text-white transition-colors duration-200 hover:text-blue-300">
        {section.title}
      </h3>
      
      {/* Section Content */}
      {section.content && (
        <p className="text-sm text-gray-300 leading-relaxed">
          {section.content}
        </p>
      )}
      
      {/* Services Grid */}
      <div className="grid grid-cols-1 gap-3">
        {visibleLinks.map((link) => (
          <div key={link.id} className="group">
            <a
              href={link.url}
              className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white transition-all duration-200 transform hover:translate-x-1"
              target={link.isExternal ? '_blank' : undefined}
              rel={link.isExternal ? 'noopener noreferrer' : undefined}
              aria-label={link.isExternal ? `${link.title} (opens in new tab)` : link.title}
            >
              {/* Service Icon */}
              <div className="w-2 h-2 bg-blue-400 rounded-full group-hover:bg-blue-300 transition-colors duration-200 flex-shrink-0"></div>
              
              {/* Service Name */}
              <span className="hover:underline">{link.title}</span>
              
              {/* External Link Indicator */}
              {link.isExternal && (
                <svg 
                  className="w-3 h-3 text-gray-400 group-hover:text-gray-300 transition-colors duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                  />
                </svg>
              )}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
} 
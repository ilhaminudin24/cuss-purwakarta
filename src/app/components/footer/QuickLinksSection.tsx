import React from 'react';
import { FooterSection, FooterLink } from './Footer';

interface QuickLinksSectionProps {
  section: FooterSection;
}

export default function QuickLinksSection({ section }: QuickLinksSectionProps) {
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
      
      {/* Links List */}
      <ul className="space-y-2" role="list">
        {visibleLinks.map((link) => (
          <li key={link.id}>
            <a
              href={link.url}
              className="text-sm text-gray-300 hover:text-white hover:underline transition-all duration-200 transform hover:translate-x-1 inline-block"
              target={link.isExternal ? '_blank' : undefined}
              rel={link.isExternal ? 'noopener noreferrer' : undefined}
              aria-label={link.isExternal ? `${link.title} (opens in new tab)` : link.title}
            >
              {link.title}
              {link.isExternal && (
                <svg 
                  className="w-3 h-3 ml-1 inline-block" 
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
          </li>
        ))}
      </ul>
    </div>
  );
} 
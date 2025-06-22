import React from 'react';
import { FooterSection, SocialMedia } from './Footer';

interface ContactSectionProps {
  section: FooterSection;
  socialMedia: SocialMedia[];
}

export default function ContactSection({ section, socialMedia }: ContactSectionProps) {
  const visibleLinks = section.links
    .filter(link => link.visible)
    .sort((a, b) => a.position - b.position);

  const visibleSocialMedia = socialMedia
    .filter(social => social.visible)
    .sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-6">
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
      
      {/* Contact Links */}
      {visibleLinks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-200">Contact Info</h4>
          <ul className="space-y-2" role="list">
            {visibleLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white transition-all duration-200 transform hover:translate-x-1"
                  target={link.isExternal ? '_blank' : undefined}
                  rel={link.isExternal ? 'noopener noreferrer' : undefined}
                  aria-label={link.isExternal ? `${link.title} (opens in new tab)` : link.title}
                >
                  {/* Contact Icon */}
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></div>
                  <span className="hover:underline">{link.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      
    </div>
  );
} 
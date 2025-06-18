"use client";

import { useEffect, useState } from 'react';
import { FaWhatsapp, FaPhone, FaInstagram, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

// Map of contact types to icons and labels
const contactTypeMap: { [key: string]: { icon: any; label: string } } = {
  'whatsapp': { icon: FaWhatsapp, label: 'WhatsApp' },
  'phone': { icon: FaPhone, label: 'Telepon' },
  'instagram': { icon: FaInstagram, label: 'Instagram' },
  'email': { icon: FaEnvelope, label: 'Email' },
  'address': { icon: FaMapMarkerAlt, label: 'Alamat' },
};

interface ContactInfo {
  id: string;
  type: string;
  value: string;
  position: number;
  isActive: boolean;
}

export default function ContactPage() {
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/contact');
        if (!response.ok) throw new Error('Failed to fetch contact info');
        const data = await response.json();
        setContacts(data.filter((contact: ContactInfo) => contact.isActive));
      } catch (error) {
        console.error('Error fetching contact info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto py-12 px-4">
      <h2 className="text-2xl sm:text-3xl font-bold text-orange-500 mb-8 text-center">Hubungi Kami</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {contacts.map((contact) => {
          const contactType = contactTypeMap[contact.type];
          if (!contactType) return null;

          const IconComponent = contactType.icon;
          const isClickable = ['whatsapp', 'phone', 'email', 'instagram'].includes(contact.type);
          let href = '';

          switch (contact.type) {
            case 'whatsapp':
              href = `https://wa.me/${contact.value.replace(/\D/g, '')}`;
              break;
            case 'phone':
              href = `tel:${contact.value.replace(/\D/g, '')}`;
              break;
            case 'email':
              href = `mailto:${contact.value}`;
              break;
            case 'instagram':
              href = `https://instagram.com/${contact.value.replace('@', '')}`;
              break;
          }

          const content = (
            <div className="flex items-center gap-4 bg-orange-500/10 border border-orange-200 rounded-xl p-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                  <IconComponent className="text-white text-2xl" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg text-orange-500 mb-1">{contactType.label}</h3>
                <p className="text-black/70">{contact.value}</p>
              </div>
            </div>
          );

          return (
            <div key={contact.id}>
              {isClickable ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block transition-transform hover:scale-105"
                >
                  {content}
                </a>
              ) : (
                content
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
} 
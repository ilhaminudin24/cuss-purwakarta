import { z } from 'zod';

// Footer Section Validation Schemas
export const FooterSectionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
  position: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
  sectionType: z.enum(['company_info', 'quick_links', 'services', 'contact', 'social_media']),
});

export const FooterSectionUpdateSchema = FooterSectionSchema.partial();

// Footer Link Validation Schemas
export const FooterLinkSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Valid URL is required'),
  position: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
  isExternal: z.boolean().default(false),
  sectionId: z.string().min(1, 'Section ID is required'),
});

export const FooterLinkUpdateSchema = FooterLinkSchema.partial();

// Social Media Validation Schemas
export const SocialMediaSchema = z.object({
  platform: z.enum(['facebook', 'instagram', 'twitter', 'youtube', 'linkedin', 'tiktok']),
  url: z.string().url('Valid URL is required'),
  icon: z.string().min(1, 'Icon is required'),
  isVisible: z.boolean().default(true),
  position: z.number().int().min(0).default(0),
});

export const SocialMediaUpdateSchema = SocialMediaSchema.partial();

// Company Info Validation Schemas
export const CompanyInfoSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  website: z.string().url('Valid URL is required').optional().or(z.literal('')),
  logo: z.string().optional(),
  copyright: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const CompanyInfoUpdateSchema = CompanyInfoSchema.partial();

// Type exports for TypeScript
export type FooterSectionInput = z.infer<typeof FooterSectionSchema>;
export type FooterSectionUpdateInput = z.infer<typeof FooterSectionUpdateSchema>;
export type FooterLinkInput = z.infer<typeof FooterLinkSchema>;
export type FooterLinkUpdateInput = z.infer<typeof FooterLinkUpdateSchema>;
export type SocialMediaInput = z.infer<typeof SocialMediaSchema>;
export type SocialMediaUpdateInput = z.infer<typeof SocialMediaUpdateSchema>;
export type CompanyInfoInput = z.infer<typeof CompanyInfoSchema>;
export type CompanyInfoUpdateInput = z.infer<typeof CompanyInfoUpdateSchema>; 
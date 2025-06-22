import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for footer link
const FooterLinkSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Invalid URL'),
  position: z.number().int().min(0).default(0),
  visible: z.boolean().default(true),
  isExternal: z.boolean().default(false),
  sectionId: z.string().min(1, 'Section ID is required'),
});

// GET - Fetch all footer links
export async function GET(request: NextRequest) {
  try {
    // Cast prisma to any to bypass type checking issues with new models
    const prismaClient = prisma as any;

    const links = await prismaClient.footerLink.findMany({
      include: {
        section: true,
      },
      orderBy: {
        position: 'asc',
      },
    });

    return NextResponse.json(links, { status: 200 });
  } catch (error) {
    console.error('Error fetching footer links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch footer links' },
      { status: 500 }
    );
  }
}

// POST - Create new footer link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = FooterLinkSchema.parse(body);

    // Cast prisma to any to bypass type checking issues with new models
    const prismaClient = prisma as any;

    const link = await prismaClient.footerLink.create({
      data: validatedData,
      include: {
        section: true,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating footer link:', error);
    return NextResponse.json(
      { error: 'Failed to create footer link' },
      { status: 500 }
    );
  }
} 
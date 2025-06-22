import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requireAuth } from '@/lib/middleware/auth';

// Validation schema for footer section
const FooterSectionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
  position: z.number().int().min(0).default(0),
  visible: z.boolean().default(true),
  sectionType: z.string(),
});

// GET - Fetch all footer sections
export async function GET(request: NextRequest) {
  // Check authentication
  const authResult = await requireAuth(request);
  if (authResult) return authResult;

  try {
    // Cast prisma to any to bypass type checking issues with new models
    const prismaClient = prisma as any;

    const sections = await prismaClient.footerSection.findMany({
      include: {
        links: {
          orderBy: {
            position: 'asc',
          },
        },
      },
      orderBy: {
        position: 'asc',
      },
    });

    return NextResponse.json(sections, { status: 200 });
  } catch (error) {
    console.error('Error fetching footer sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch footer sections' },
      { status: 500 }
    );
  }
}

// POST - Create new footer section
export async function POST(request: NextRequest) {
  // Check authentication
  const authResult = await requireAuth(request);
  if (authResult) return authResult;

  try {
    const body = await request.json();
    const validatedData = FooterSectionSchema.parse(body);

    // Cast prisma to any to bypass type checking issues with new models
    const prismaClient = prisma as any;

    const section = await prismaClient.footerSection.create({
      data: validatedData,
      include: {
        links: true,
      },
    });

    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating footer section:', error);
    return NextResponse.json(
      { error: 'Failed to create footer section' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for social media
const SocialMediaSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  url: z.string().url('Invalid URL'),
  icon: z.string().min(1, 'Icon is required'),
  position: z.number().int().min(0).default(0),
  visible: z.boolean().default(true),
});

// GET - Fetch all social media links
export async function GET(request: NextRequest) {
  try {
    // Cast prisma to any to bypass type checking issues with new models
    const prismaClient = prisma as any;

    const socialMedia = await prismaClient.socialMedia.findMany({
      orderBy: {
        position: 'asc',
      },
    });

    return NextResponse.json(socialMedia, { status: 200 });
  } catch (error) {
    console.error('Error fetching social media links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social media links' },
      { status: 500 }
    );
  }
}

// POST - Create new social media link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = SocialMediaSchema.parse(body);

    // Cast prisma to any to bypass type checking issues with new models
    const prismaClient = prisma as any;

    const socialMedia = await prismaClient.socialMedia.create({
      data: validatedData,
    });

    return NextResponse.json(socialMedia, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating social media link:', error);
    return NextResponse.json(
      { error: 'Failed to create social media link' },
      { status: 500 }
    );
  }
} 
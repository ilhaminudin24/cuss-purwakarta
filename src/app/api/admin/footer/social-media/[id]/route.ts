import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for social media update
const SocialMediaUpdateSchema = z.object({
  platform: z.string().min(1, 'Platform is required').optional(),
  url: z.string().url('Invalid URL').optional(),
  icon: z.string().optional(),
  position: z.number().int().min(0).optional(),
  visible: z.boolean().optional(),
});

// PUT - Update social media link
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = SocialMediaUpdateSchema.parse(body);

    // Cast prisma to any to bypass type checking issues with new models
    const prismaClient = prisma as any;

    const socialMedia = await prismaClient.socialMedia.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(socialMedia, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating social media link:', error);
    return NextResponse.json(
      { error: 'Failed to update social media link' },
      { status: 500 }
    );
  }
}

// DELETE - Delete social media link
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Cast prisma to any to bypass type checking issues with new models
    const prismaClient = prisma as any;

    await prismaClient.socialMedia.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Social media link deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting social media link:', error);
    return NextResponse.json(
      { error: 'Failed to delete social media link' },
      { status: 500 }
    );
  }
} 
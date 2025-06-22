import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for footer link update
const FooterLinkUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  url: z.string().url('Invalid URL').optional(),
  position: z.number().int().min(0).optional(),
  visible: z.boolean().optional(),
  isExternal: z.boolean().optional(),
  sectionId: z.string().optional(),
});

// PUT - Update footer link
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = FooterLinkUpdateSchema.parse(body);

    // Cast prisma to any to bypass type checking issues with new models
    const prismaClient = prisma as any;

    const link = await prismaClient.footerLink.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        section: true,
      },
    });

    return NextResponse.json(link, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating footer link:', error);
    return NextResponse.json(
      { error: 'Failed to update footer link' },
      { status: 500 }
    );
  }
}

// DELETE - Delete footer link
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Cast prisma to any to bypass type checking issues with new models
    const prismaClient = prisma as any;

    await prismaClient.footerLink.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Footer link deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting footer link:', error);
    return NextResponse.json(
      { error: 'Failed to delete footer link' },
      { status: 500 }
    );
  }
} 
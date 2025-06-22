import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for footer section update
const FooterSectionUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  content: z.string().optional(),
  position: z.number().int().min(0).optional(),
  visible: z.boolean().optional(),
  sectionType: z.string().optional(),
});

// PUT - Update footer section
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = FooterSectionUpdateSchema.parse(body);

    // Cast prisma to any to bypass type checking issues with new models
    const prismaClient = prisma as any;

    const section = await prismaClient.footerSection.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        links: true,
      },
    });

    return NextResponse.json(section, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating footer section:', error);
    return NextResponse.json(
      { error: 'Failed to update footer section' },
      { status: 500 }
    );
  }
}

// DELETE - Delete footer section
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Cast prisma to any to bypass type checking issues with new models
    const prismaClient = prisma as any;

    await prismaClient.footerSection.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Footer section deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting footer section:', error);
    return NextResponse.json(
      { error: 'Failed to delete footer section' },
      { status: 500 }
    );
  }
} 
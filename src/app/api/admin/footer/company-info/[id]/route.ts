import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for company info update
const CompanyInfoUpdateSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  website: z.string().url('Valid URL is required').optional().or(z.literal('')),
  logo: z.string().optional(),
  copyright: z.string().optional(),
  isActive: z.boolean().optional(),
});

// PUT - Update company info
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = CompanyInfoUpdateSchema.parse(body);

    // Cast prisma to any to bypass type checking issues with new models
    const prismaClient = prisma as any;

    const companyInfo = await prismaClient.companyInfo.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(companyInfo, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating company info:', error);
    return NextResponse.json(
      { error: 'Failed to update company info' },
      { status: 500 }
    );
  }
}

// DELETE - Delete company info
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Cast prisma to any to bypass type checking issues with new models
    const prismaClient = prisma as any;

    await prismaClient.companyInfo.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Company info deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting company info:', error);
    return NextResponse.json(
      { error: 'Failed to delete company info' },
      { status: 500 }
    );
  }
} 
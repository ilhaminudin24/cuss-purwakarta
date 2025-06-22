import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for company info
const CompanyInfoSchema = z.object({
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

// GET - Fetch company info
export async function GET(request: NextRequest) {
  try {
    // Cast prisma to any to bypass type checking issues with new models
    const prismaClient = prisma as any;

    const companyInfo = await prismaClient.companyInfo.findFirst({
      where: {
        isActive: true,
      },
    });

    return NextResponse.json(companyInfo, { status: 200 });
  } catch (error) {
    console.error('Error fetching company info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company info' },
      { status: 500 }
    );
  }
}

// POST - Create new company info
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CompanyInfoSchema.parse(body);

    // Cast prisma to any to bypass type checking issues with new models
    const prismaClient = prisma as any;

    // Deactivate any existing active company info
    await prismaClient.companyInfo.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    const companyInfo = await prismaClient.companyInfo.create({
      data: validatedData,
    });

    return NextResponse.json(companyInfo, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating company info:', error);
    return NextResponse.json(
      { error: 'Failed to create company info' },
      { status: 500 }
    );
  }
} 
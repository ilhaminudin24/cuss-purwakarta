import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Cast prisma to any to bypass type checking issues with new models
    const prismaClient = prisma as any;

    // Get all visible footer sections with their links
    const sections = await prismaClient.footerSection.findMany({
      where: { visible: true },
      include: {
        links: {
          where: { visible: true },
          orderBy: {
            position: 'asc',
          },
        },
      },
      orderBy: {
        position: 'asc',
      },
    });

    // Get all visible social media links
    const socialMedia = await prismaClient.socialMedia.findMany({
      where: { visible: true },
      orderBy: {
        position: 'asc',
      },
    });

    // Get active company info
    const companyInfo = await prismaClient.companyInfo.findFirst({
      where: {
        isActive: true,
      },
    });

    // Structure the response
    const footerData = {
      sections,
      socialMedia,
      companyInfo,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(footerData, { status: 200 });
  } catch (error) {
    console.error('Error fetching footer data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch footer data' },
      { status: 500 }
    );
  }
} 
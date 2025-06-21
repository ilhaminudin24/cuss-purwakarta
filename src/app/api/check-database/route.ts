import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get database connection info
    const databaseUrl = process.env.DATABASE_URL || 'Not set';
    const nodeEnv = process.env.NODE_ENV || 'Not set';
    
    // Extract database name from connection string
    const dbName = databaseUrl.match(/\/\/([^?]+)\?/)?.[1]?.split('/')?.[1] || 'unknown';
    
    // Test connection by counting users
    const userCount = await prisma.user.count();
    const serviceCount = await prisma.service.count();
    const faqCount = await prisma.fAQ.count();
    
    // Determine if this is development or production
    const isDevelopment = dbName.includes('dev') || dbName.includes('development') || nodeEnv === 'development';
    
    return NextResponse.json({
      success: true,
      database: {
        name: dbName,
        url: databaseUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'), // Hide credentials
        environment: nodeEnv,
        isDevelopment: isDevelopment
      },
      connection: {
        status: 'Connected',
        userCount,
        serviceCount,
        faqCount
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        name: 'Unknown',
        url: process.env.DATABASE_URL ? 'Set but connection failed' : 'Not set',
        environment: process.env.NODE_ENV || 'Not set'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
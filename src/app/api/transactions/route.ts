import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Log received data for debugging
    console.log('Received form data:', JSON.stringify(data, null, 2));

    // Validate location format if pickup/destination are present
    const validateLocation = (location: any) => {
      return (
        location &&
        typeof location === 'object' &&
        typeof location.lat === 'number' &&
        typeof location.lng === 'number' &&
        typeof location.address === 'string'
      );
    };

    // Prepare default location object for required fields
    const defaultLocation = {
      lat: 0,
      lng: 0,
      address: ''
    };

    // Separate base fields from dynamic fields
    const {
      name,
      whatsapp,
      service,
      pickup,
      destination,
      distance,
      subscription,
      notes,
      status,
      latitude,
      longitude,
      ...dynamicFields
    } = data;

    // Create the transaction record with required fields
    const transactionData = {
      name: name || 'Anonymous',
      whatsapp: whatsapp || null,
      service: service || 'Unknown',
      pickup: validateLocation(pickup) ? pickup : defaultLocation,
      destination: validateLocation(destination) ? destination : defaultLocation,
      distance: distance ? (typeof distance === 'number' ? distance : parseFloat(distance)) : 0,
      subscription: Boolean(subscription),
      notes: notes || null,
      status: status || "pending",
      latitude: latitude ? (typeof latitude === 'number' ? latitude : parseFloat(latitude)) : null,
      longitude: longitude ? (typeof longitude === 'number' ? longitude : parseFloat(longitude)) : null,
      dynamicFields: Object.keys(dynamicFields).length > 0 ? dynamicFields : null
    };

    try {
      const result = await prisma.transaction.create({
        data: transactionData
      });
      console.log('Transaction created successfully:', result);
      return NextResponse.json(result);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: "Failed to save transaction to database", details: dbError },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: "Internal server error", details: error },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.transaction.count()
    ]);

    return NextResponse.json({
      transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();
    
    // Check if we're deleting multiple transactions
    if (Array.isArray(data.ids)) {
      // Bulk delete
      const result = await prisma.transaction.deleteMany({
        where: {
          id: {
            in: data.ids
          }
        }
      });
      return NextResponse.json({ 
        message: `Successfully deleted ${result.count} transactions`,
        count: result.count 
      });
    } else if (data.id) {
      // Single delete
      const result = await prisma.transaction.delete({
        where: {
          id: data.id
        }
      });
      return NextResponse.json({ 
        message: "Successfully deleted transaction",
        transaction: result 
      });
    } else {
      return NextResponse.json(
        { error: "No transaction ID(s) provided" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error deleting transaction(s):", error);
    return NextResponse.json(
      { error: "Failed to delete transaction(s)" },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Log received data for debugging
    console.log('Received form data:', JSON.stringify(data, null, 2));

    // Validate required fields
    if (!data.name || !data.service || !data.pickup || !data.destination || !data.distance) {
      console.error('Missing required fields:', {
        name: !data.name,
        service: !data.service,
        pickup: !data.pickup,
        destination: !data.destination,
        distance: !data.distance
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure pickup and destination are valid JSON objects
    const pickup = typeof data.pickup === 'string' ? JSON.parse(data.pickup) : data.pickup;
    const destination = typeof data.destination === 'string' ? JSON.parse(data.destination) : data.destination;

    // Log the data we're about to save
    const transactionData = {
      name: data.name,
      whatsapp: data.whatsapp || null,
      service: data.service,
      pickup,
      destination,
      distance: typeof data.distance === 'string' ? parseFloat(data.distance) : data.distance,
      subscription: Boolean(data.subscription),
      notes: data.notes || null,
      status: "pending"
    };
    console.log('Creating transaction with data:', transactionData);

    // Create the transaction record
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
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    try {
      // Now fetch all transactions
      const transactions = await prisma.transaction.findMany({
        orderBy: { createdAt: "desc" }
      });

      return NextResponse.json(transactions);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: "Failed to fetch transactions", details: dbError },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in GET /api/transactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    const configs = await prisma.serviceConfig.findMany({
      orderBy: {
        serviceName: "asc",
      },
    });

    return NextResponse.json(configs);
  } catch (error) {
    console.error("Error fetching service configs:", error);
    return NextResponse.json(
      { error: "Failed to fetch service configs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { serviceName, showPickup, showDestination, showDirections, firstStepFields, secondStepFields } = data;

    // Validate required fields
    if (!serviceName) {
      return NextResponse.json(
        { error: "Service name is required" },
        { status: 400 }
      );
    }

    // Check if service name already exists
    const existing = await prisma.serviceConfig.findUnique({
      where: { serviceName },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Service configuration already exists" },
        { status: 400 }
      );
    }

    const config = await prisma.serviceConfig.create({
      data: {
        serviceName,
        showPickup: showPickup ?? true,
        showDestination: showDestination ?? true,
        showDirections: showDirections ?? true,
        firstStepFields: firstStepFields || [],
        secondStepFields: secondStepFields || [],
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error creating service config:", error);
    return NextResponse.json(
      { error: "Failed to create service config" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { id, ...configData } = data;

    const config = await prisma.serviceConfig.update({
      where: { id },
      data: configData,
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error updating service config:", error);
    return NextResponse.json(
      { error: "Failed to update service config" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    await prisma.serviceConfig.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting service config:", error);
    return NextResponse.json(
      { error: "Failed to delete service config" },
      { status: 500 }
    );
  }
} 
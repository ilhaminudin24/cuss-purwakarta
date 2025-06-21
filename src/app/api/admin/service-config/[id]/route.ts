import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = await prisma.serviceConfig.findUnique({
      where: { id: params.id },
    });

    if (!config) {
      return NextResponse.json(
        { error: "Service configuration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error fetching service config:", error);
    return NextResponse.json(
      { error: "Failed to fetch service config" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

    // Check if service name already exists for other configs
    const existing = await prisma.serviceConfig.findFirst({
      where: {
        serviceName,
        NOT: {
          id: params.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Service name already exists" },
        { status: 400 }
      );
    }

    const config = await prisma.serviceConfig.update({
      where: { id: params.id },
      data: {
        serviceName,
        showPickup,
        showDestination,
        showDirections,
        firstStepFields: firstStepFields || [],
        secondStepFields: secondStepFields || [],
      },
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

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.serviceConfig.delete({
      where: { id: params.id },
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
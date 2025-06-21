import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Always return all fields for admin UI
    const fields = await prisma.bookingFormField.findMany({
      orderBy: { position: "asc" },
    });

    // Update service field options with services from Service model
    const services = await prisma.service.findMany({
      orderBy: { position: "asc" }
    });
    
    const serviceField = fields.find(f => f.name === 'service');
    if (serviceField) {
      serviceField.options = services.map(service => service.title);
      serviceField.readonly = true; // Make service field readonly
    }

    return NextResponse.json(fields);
  } catch (error) {
    console.error("Error fetching booking form fields:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking form fields" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { label, name, type, required, readonly, options, isActive, position, autoCalculate } = await req.json();
  if (!label || !name || !type) {
    return NextResponse.json({ error: "label, name, and type are required." }, { status: 400 });
  }
  const field = await prisma.bookingFormField.create({
    data: { 
      label, 
      name, 
      type, 
      required: !!required, 
      readonly: !!readonly,
      options: options ?? [], 
      isActive: isActive ?? true,
      position: position ?? 0,
      autoCalculate: autoCalculate ?? null
    },
  });
  return NextResponse.json(field);
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { id, ...fieldData } = data;

    // Ensure options is always an array
    if (typeof fieldData.options === 'string') {
      fieldData.options = fieldData.options
        .split(',')
        .map((opt: string) => opt.trim())
        .filter((opt: string) => opt.length > 0);
    }

    const field = await prisma.bookingFormField.update({
      where: { id },
      data: fieldData,
    });

    // If this is the service field, sync BookingService table
    if (field.name === 'service' && field.type === 'select' && Array.isArray(field.options)) {
      const newOptions = field.options;
      // Fetch current services
      const currentServices = await prisma.bookingService.findMany();
      const currentNames = currentServices.map(s => s.name);

      // Add or update services
      for (let i = 0; i < newOptions.length; i++) {
        const name = newOptions[i];
        const existing = currentServices.find(s => s.name === name);
        if (existing) {
          // Update position and activate if needed
          await prisma.bookingService.update({
            where: { id: existing.id },
            data: { position: i, isActive: true },
          });
        } else {
          // Create new service
          await prisma.bookingService.create({
            data: { name, isActive: true, position: i },
          });
        }
      }

      // Remove services not in new options
      for (const service of currentServices) {
        if (!newOptions.includes(service.name)) {
          await prisma.bookingService.delete({ where: { id: service.id } });
        }
      }
    }

    return NextResponse.json(field);
  } catch (error) {
    console.error("Error updating booking form field:", error);
    return NextResponse.json(
      { error: "Failed to update booking form field" },
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

    await prisma.bookingFormField.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting booking form field:", error);
    return NextResponse.json(
      { error: "Failed to delete booking form field" },
      { status: 500 }
    );
  }
} 
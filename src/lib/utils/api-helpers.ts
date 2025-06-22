import { NextResponse } from 'next/server';
import { z } from 'zod';

// Standard error response helper
export function createErrorResponse(
  message: string,
  status: number = 500,
  details?: any
) {
  console.error(`API Error (${status}):`, message, details);
  
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

// Validation error response helper
export function createValidationErrorResponse(error: z.ZodError) {
  return createErrorResponse(
    'Validation error',
    400,
    error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }))
  );
}

// Success response helper
export function createSuccessResponse(data: any, status: number = 200) {
  return NextResponse.json(
    {
      data,
      success: true,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

// Database error handler
export function handleDatabaseError(error: any, operation: string) {
  console.error(`Database error during ${operation}:`, error);
  
  // Handle specific database errors
  if (error.code === 'P2002') {
    return createErrorResponse('Duplicate entry found', 409);
  }
  
  if (error.code === 'P2025') {
    return createErrorResponse('Record not found', 404);
  }
  
  return createErrorResponse(`Failed to ${operation}`, 500);
}

// Request validation helper
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: NextResponse }> {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: createValidationErrorResponse(error) };
    }
    return { success: false, error: createErrorResponse('Invalid request body', 400) };
  }
} 
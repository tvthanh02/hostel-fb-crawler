import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID
    if (!params.id) {
      return NextResponse.json(
        { success: false, error: 'Hostel ID is required' },
        { status: 400 }
      );
    }

    const hostel = await prisma.hostel.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        address: true,
        district: true,
        ward: true,
        price: true,
        area: true,
        postedBy: true,
        postedAt: true,
        fbLink: true,
        fbGroupName: true,
        coordinates: true,
        amenities: true,
        rules: true,
        images: true,
        contactPhone: true,
        depositRequired: true,
        utilities: true,
        roomType: true,
        available: true,
        createdAt: true,
        updatedAt: true,
        // rawFbData excluded for security/performance
      },
    });

    if (!hostel) {
      return NextResponse.json(
        { success: false, error: 'Hostel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: hostel,
    });
  } catch (error) {
    console.error('[API] Error fetching hostel detail:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch hostel detail',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID
    if (!params.id) {
      return NextResponse.json(
        { success: false, error: 'Hostel ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate and sanitize update data
    const allowedFields = [
      'title',
      'description',
      'address',
      'district',
      'ward',
      'price',
      'area',
      'amenities',
      'rules',
      'contactPhone',
      'depositRequired',
      'utilities',
      'roomType',
      'available',
    ];

    // Filter only allowed fields
    const updateData: Record<string, unknown> = {};
    Object.keys(body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updateData[key] = body[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const hostel = await prisma.hostel.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        address: true,
        district: true,
        ward: true,
        price: true,
        area: true,
        postedBy: true,
        postedAt: true,
        fbLink: true,
        fbGroupName: true,
        coordinates: true,
        amenities: true,
        rules: true,
        images: true,
        contactPhone: true,
        depositRequired: true,
        utilities: true,
        roomType: true,
        available: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: hostel,
      message: 'Hostel updated successfully',
    });
  } catch (error) {
    console.error('[API] Error updating hostel:', error);

    // Handle not found error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { success: false, error: 'Hostel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update hostel',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID
    if (!params.id) {
      return NextResponse.json(
        { success: false, error: 'Hostel ID is required' },
        { status: 400 }
      );
    }

    // Soft delete by marking as unavailable
    await prisma.hostel.update({
      where: { id: params.id },
      data: { available: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Hostel deleted successfully',
    });
  } catch (error) {
    console.error('[API] Error deleting hostel:', error);

    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { success: false, error: 'Hostel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete hostel',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
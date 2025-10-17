import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { HostelFilters } from '@/types/hostel';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse filters
    const filters: HostelFilters = {
      district: searchParams.get('district') || undefined,
      priceMin: searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : undefined,
      priceMax: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : undefined,
      areaMin: searchParams.get('areaMin') ? Number(searchParams.get('areaMin')) : undefined,
      areaMax: searchParams.get('areaMax') ? Number(searchParams.get('areaMax')) : undefined,
      roomType: searchParams.get('roomType') || undefined,
      search: searchParams.get('search') || undefined,
    };

    // Pagination
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20));
    const skip = (page - 1) * limit;

    // Sort options
    const sortBy = searchParams.get('sortBy') || 'postedAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      available: true,
    };

    if (filters.district) {
      where.district = { contains: filters.district, mode: 'insensitive' };
    }

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      where.price = {};
      if (filters.priceMin !== undefined) where.price.gte = filters.priceMin;
      if (filters.priceMax !== undefined) where.price.lte = filters.priceMax;
    }

    if (filters.areaMin !== undefined || filters.areaMax !== undefined) {
      where.area = {};
      if (filters.areaMin !== undefined) where.area.gte = filters.areaMin;
      if (filters.areaMax !== undefined) where.area.lte = filters.areaMax;
    }

    if (filters.roomType) {
      where.roomType = filters.roomType;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { address: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Get hostels with pagination
    const [hostels, total] = await Promise.all([
      prisma.hostel.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
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
          // Exclude rawFbData from list response
        },
      }),
      prisma.hostel.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: hostels,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
      filters,
    });
  } catch (error) {
    console.error('[API] Error fetching hostels:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch hostels',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
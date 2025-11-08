import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { getPaginationParams, ApiResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return ApiResponse.unauthorized('Authentication required');
    }

    if (!['admin', 'editor'].includes(session.user.role)) {
      return ApiResponse.forbidden('Insufficient permissions');
    }

    await connectDB();

    const { page, limit, skip, sort, filters } = getPaginationParams(request);
    const { searchParams } = new URL(request.url);
    
    // Build query filters
    const query: any = {};
    
    // Status filter
    if (filters.status) {
      query.status = filters.status;
    }
    
    // Category filter
    const category = searchParams.get('category');
    if (category) {
      query.category = category;
    }
    
    // Search filter
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { sku: { $regex: filters.search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    // Fetch products with pagination
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .select('-__v')
      .lean();

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return ApiResponse.success({
      products: products.map((product: any) => ({
        id: product._id?.toString() || '',
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        price: product.price,
        currency: product.currency,
        compareAtPrice: product.compareAtPrice,
        costPrice: product.costPrice,
        sku: product.sku,
        barcode: product.barcode,
        category: product.category,
        subcategory: product.subcategory,
        tags: product.tags || [],
        status: product.status,
        isDigital: product.isDigital,
        isPhysical: product.isPhysical,
        inventory: product.inventory,
        images: product.images || [],
        isFeatured: product.isFeatured,
        isNew: product.isNew,
        isOnSale: product.isOnSale,
        viewCount: product.viewCount || 0,
        purchaseCount: product.purchaseCount || 0,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return ApiResponse.error(
      'Failed to fetch products',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return ApiResponse.unauthorized('Authentication required');
    }

    if (!['admin', 'editor'].includes(session.user.role)) {
      return ApiResponse.forbidden('Insufficient permissions');
    }

    await connectDB();

    const body = await request.json();
    const { z } = await import('zod');

    const createProductSchema = z.object({
      name: z.string().min(1, 'Name is required').max(200),
      description: z.string().min(1, 'Description is required'),
      shortDescription: z.string().max(300).optional(),
      price: z.number().min(0, 'Price must be positive'),
      currency: z.string().default('USD'),
      compareAtPrice: z.number().optional(),
      costPrice: z.number().optional(),
      sku: z.string().optional(),
      barcode: z.string().optional(),
      category: z.enum(['book', 'merchandise', 'digital', 'service', 'other']),
      subcategory: z.string().optional(),
      tags: z.array(z.string()).optional(),
      status: z.enum(['draft', 'active', 'inactive', 'archived']).default('draft'),
      isDigital: z.boolean().default(false),
      isPhysical: z.boolean().default(true),
      inventory: z.object({
        trackQuantity: z.boolean().default(false),
        quantity: z.number().default(0),
        lowStockThreshold: z.number().default(5),
        allowBackorder: z.boolean().default(false)
      }).optional(),
      images: z.array(z.object({
        url: z.string().url(),
        alt: z.string().optional(),
        isPrimary: z.boolean().default(false)
      })).optional(),
      isFeatured: z.boolean().default(false),
      isNew: z.boolean().default(false),
      isOnSale: z.boolean().default(false)
    });

    const validation = createProductSchema.safeParse(body);
    
    if (!validation.success) {
      const errors = validation.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return ApiResponse.validationError(errors);
    }

    const validatedData = validation.data;

    // Generate unique slug
    function generateSlug(name: string): string {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    let slug = generateSlug(validatedData.name);
    let slugCounter = 1;
    const originalSlug = slug;

    while (await Product.findOne({ slug })) {
      slug = `${originalSlug}-${slugCounter}`;
      slugCounter++;
    }

    // Create product
    const product = new Product({
      ...validatedData,
      slug,
      createdBy: session.user.id
    });

    await product.save();

    return ApiResponse.success({
      id: product._id.toString(),
      name: product.name,
      slug: product.slug,
      status: product.status,
      createdAt: product.createdAt
    }, 'Product created successfully', 201);

  } catch (error) {
    console.error('Error creating product:', error);
    return ApiResponse.error(
      'Failed to create product',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}


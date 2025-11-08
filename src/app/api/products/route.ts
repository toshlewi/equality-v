import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock') === 'true';

    await connectDB();

    // Build query - only show active products
    const query: any = { status: 'active' };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    if (inStock) {
      query['inventory.quantity'] = { $gt: 0 };
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit)
      .select('-variants -seoTitle -seoDescription -seoKeywords -createdBy -updatedBy'); // Exclude heavy/admin fields

    const total = await Product.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        products: products.map((product: any) => ({
          id: product._id.toString(),
          name: product.name,
          slug: product.slug,
          price: product.price,
          currency: product.currency,
          compareAtPrice: product.compareAtPrice,
          category: product.category,
          subcategory: product.subcategory,
          images: product.images || [],
          inventory: product.inventory || { trackQuantity: false, quantity: 0 },
          description: product.description,
          shortDescription: product.shortDescription,
          status: product.status,
          rating: product.rating || 0,
          reviewCount: product.reviewCount || 0,
          isFeatured: product.isFeatured || false,
          isNew: product.isNew || false,
          isOnSale: product.isOnSale || false,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

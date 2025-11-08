import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { ApiResponse, validateRequest } from '@/lib/api-utils';
import { createAuditLog } from '@/lib/audit';
import { z } from 'zod';

const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  shortDescription: z.string().max(300).optional(),
  price: z.number().min(0).optional(),
  currency: z.string().optional(),
  compareAtPrice: z.number().optional(),
  costPrice: z.number().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  category: z.enum(['book', 'merchandise', 'digital', 'service', 'other']).optional(),
  subcategory: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'active', 'inactive', 'archived']).optional(),
  isDigital: z.boolean().optional(),
  isPhysical: z.boolean().optional(),
  inventory: z.object({
    trackQuantity: z.boolean().optional(),
    quantity: z.number().optional(),
    lowStockThreshold: z.number().optional(),
    allowBackorder: z.boolean().optional()
  }).optional(),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string().optional(),
    isPrimary: z.boolean().default(false)
  })).optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isOnSale: z.boolean().optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return ApiResponse.unauthorized('Authentication required');
    }

    if (!['admin', 'editor'].includes(session.user.role)) {
      return ApiResponse.forbidden('Insufficient permissions');
    }

    await connectDB();

    const product = await Product.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean();

    if (!product) {
      return ApiResponse.notFound('Product not found');
    }

    const productDoc = product as any;

    return ApiResponse.success({
      id: productDoc._id?.toString() || '',
      name: productDoc.name,
      slug: productDoc.slug,
      description: productDoc.description,
      shortDescription: productDoc.shortDescription,
      price: productDoc.price,
      currency: productDoc.currency,
      compareAtPrice: productDoc.compareAtPrice,
      costPrice: productDoc.costPrice,
      sku: productDoc.sku,
      barcode: productDoc.barcode,
      category: productDoc.category,
      subcategory: productDoc.subcategory,
      tags: productDoc.tags || [],
      status: productDoc.status,
      isDigital: productDoc.isDigital,
      isPhysical: productDoc.isPhysical,
      inventory: productDoc.inventory,
      images: productDoc.images || [],
      files: productDoc.files || [],
      variants: productDoc.variants || [],
      isFeatured: productDoc.isFeatured,
      isNew: productDoc.isNew,
      isOnSale: productDoc.isOnSale,
      saleStartDate: productDoc.saleStartDate,
      saleEndDate: productDoc.saleEndDate,
      seoTitle: productDoc.seoTitle,
      seoDescription: productDoc.seoDescription,
      seoKeywords: productDoc.seoKeywords || [],
      viewCount: productDoc.viewCount || 0,
      purchaseCount: productDoc.purchaseCount || 0,
      rating: productDoc.rating || 0,
      reviewCount: productDoc.reviewCount || 0,
      createdAt: productDoc.createdAt,
      updatedAt: productDoc.updatedAt
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    return ApiResponse.error(
      'Failed to fetch product',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return ApiResponse.unauthorized('Authentication required');
    }

    if (!['admin', 'editor'].includes(session.user.role)) {
      return ApiResponse.forbidden('Insufficient permissions');
    }

    await connectDB();

    const body = await request.json();
    const validation = validateRequest(updateProductSchema, body);

    if (!validation.success) {
      return ApiResponse.validationError(validation.errors);
    }

    const product = await Product.findById(id);

    if (!product) {
      return ApiResponse.notFound('Product not found');
    }

    // Track old status for audit log
    const oldStatus = product.status;

    // Update product
    Object.assign(product, validation.data);
    product.updatedBy = session.user.id;
    await product.save();

    // Log audit trail
    try {
      await createAuditLog({
        eventType: 'admin_action',
        description: `Product ${product._id.toString()} (${product.name}) updated`,
        userId: session.user.id,
        userEmail: session.user.email || '',
        userRole: session.user.role,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        requestMethod: 'PATCH',
        requestUrl: request.url,
        metadata: {
          productId: product._id.toString(),
          productName: product.name,
          oldStatus,
          newStatus: product.status
        },
        severity: 'low',
        status: 'success'
      });
    } catch (auditError) {
      console.error('Error creating audit log:', auditError);
      // Don't fail the request if audit log fails
    }

    return ApiResponse.success({
      id: product._id.toString(),
      name: product.name,
      slug: product.slug,
      status: product.status,
      updatedAt: product.updatedAt
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return ApiResponse.error(
      'Failed to update product',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return ApiResponse.unauthorized('Authentication required');
    }

    if (!['admin'].includes(session.user.role)) {
      return ApiResponse.forbidden('Only admins can delete products');
    }

    await connectDB();

    const product = await Product.findById(id);

    if (!product) {
      return ApiResponse.notFound('Product not found');
    }

    // Soft delete: set status to archived
    product.status = 'archived';
    product.updatedBy = session.user.id;
    await product.save();

    return ApiResponse.success({
      message: 'Product archived successfully'
    });

  } catch (error) {
    console.error('Error archiving product:', error);
    return ApiResponse.error(
      'Failed to archive product',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import Setting from '@/models/Setting';
import { ApiResponse } from '@/lib/api-utils';
import { createAuditLog } from '@/lib/audit';

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

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const query: any = {};
    if (category) {
      query.category = category;
    }

    const settings = await Setting.find(query)
      .sort({ category: 1, key: 1 })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean();

    // Group by category
    const grouped: Record<string, any[]> = {};
    settings.forEach(setting => {
      const cat = setting.category || 'general';
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push({
        id: setting._id.toString(),
        key: setting.key,
        value: setting.value,
        type: setting.type,
        description: setting.description,
        category: setting.category,
        isPublic: setting.isPublic,
        isRequired: setting.isRequired,
        validation: setting.validation,
        createdAt: setting.createdAt,
        updatedAt: setting.updatedAt
      });
    });

    return ApiResponse.success({
      settings: grouped,
      categories: Object.keys(grouped)
    });

  } catch (error) {
    console.error('Error fetching settings:', error);
    return ApiResponse.error(
      'Failed to fetch settings',
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

    if (!['admin'].includes(session.user.role)) {
      return ApiResponse.forbidden('Only admins can create settings');
    }

    await connectDB();

    const body = await request.json();
    const { z } = await import('zod');

    const createSettingSchema = z.object({
      key: z.string().min(1, 'Key is required').max(100),
      value: z.any(),
      type: z.enum(['string', 'number', 'boolean', 'text', 'email', 'url', 'json', 'array']).default('string'),
      description: z.string().max(500).optional(),
      category: z.string().default('general'),
      isPublic: z.boolean().default(false),
      isRequired: z.boolean().default(false),
      validation: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
        pattern: z.string().optional(),
        options: z.array(z.string()).optional()
      }).optional()
    });

    const validation = createSettingSchema.safeParse(body);
    
    if (!validation.success) {
      return ApiResponse.validationError(validation.error.errors);
    }

    const validatedData = validation.data;

    // Check if setting already exists
    const existing = await Setting.findOne({ key: validatedData.key });
    if (existing) {
      return ApiResponse.error(
        'Setting with this key already exists',
        400,
        'Use PATCH to update existing settings'
      );
    }

    // Create setting
    const setting = new Setting({
      ...validatedData,
      value: validatedData.type === 'json' || validatedData.type === 'array' 
        ? JSON.stringify(validatedData.value) 
        : validatedData.value,
      createdBy: session.user.id,
      updatedBy: session.user.id
    });

    await setting.save();

    // Log audit event
    await createAuditLog({
      eventType: 'admin_action',
      description: `Setting created: ${validatedData.key}`,
      userId: session.user.id,
      userEmail: session.user.email || '',
      userRole: session.user.role,
      ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      requestMethod: 'POST',
      requestUrl: request.url,
      metadata: {
        settingKey: validatedData.key,
        settingCategory: validatedData.category
      },
      severity: 'low',
      status: 'success'
    });

    return ApiResponse.success({
      id: setting._id.toString(),
      key: setting.key,
      value: setting.value,
      type: setting.type,
      category: setting.category,
      createdAt: setting.createdAt
    }, 201);

  } catch (error) {
    console.error('Error creating setting:', error);
    return ApiResponse.error(
      'Failed to create setting',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return ApiResponse.unauthorized('Authentication required');
    }

    if (!['admin'].includes(session.user.role)) {
      return ApiResponse.forbidden('Only admins can update settings');
    }

    await connectDB();

    const body = await request.json();
    const { z } = await import('zod');

    const updateSettingSchema = z.object({
      key: z.string().min(1, 'Key is required'),
      value: z.any().optional(),
      type: z.enum(['string', 'number', 'boolean', 'text', 'email', 'url', 'json', 'array']).optional(),
      description: z.string().max(500).optional(),
      category: z.string().optional(),
      isPublic: z.boolean().optional(),
      isRequired: z.boolean().optional()
    });

    const validation = updateSettingSchema.safeParse(body);
    
    if (!validation.success) {
      return ApiResponse.validationError(validation.error.errors);
    }

    const validatedData = validation.data;

    // Find setting
    const setting = await Setting.findOne({ key: validatedData.key });
    if (!setting) {
      return ApiResponse.notFound('Setting not found');
    }

    // Store old value for audit
    const oldValue = setting.value;

    // Update setting
    if (validatedData.value !== undefined) {
      setting.value = validatedData.type === 'json' || validatedData.type === 'array' 
        ? JSON.stringify(validatedData.value) 
        : validatedData.value;
    }
    if (validatedData.type !== undefined) setting.type = validatedData.type;
    if (validatedData.description !== undefined) setting.description = validatedData.description;
    if (validatedData.category !== undefined) setting.category = validatedData.category;
    if (validatedData.isPublic !== undefined) setting.isPublic = validatedData.isPublic;
    if (validatedData.isRequired !== undefined) setting.isRequired = validatedData.isRequired;
    
    setting.updatedBy = session.user.id;
    await setting.save();

    // Log audit event
    await createAuditLog({
      eventType: 'admin_action',
      description: `Setting updated: ${validatedData.key}`,
      userId: session.user.id,
      userEmail: session.user.email || '',
      userRole: session.user.role,
      ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      requestMethod: 'PATCH',
      requestUrl: request.url,
      metadata: {
        settingKey: validatedData.key,
        oldValue,
        newValue: setting.value
      },
      severity: 'medium',
      status: 'success'
    });

    return ApiResponse.success({
      id: setting._id.toString(),
      key: setting.key,
      value: setting.value,
      type: setting.type,
      category: setting.category,
      updatedAt: setting.updatedAt
    });

  } catch (error) {
    console.error('Error updating setting:', error);
    return ApiResponse.error(
      'Failed to update setting',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}


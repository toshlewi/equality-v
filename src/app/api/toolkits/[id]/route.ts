import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Toolkit from '@/models/Toolkit';
import mongoose from 'mongoose';

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const { id } = params;
    const query = isValidObjectId(id) ? { _id: id } : { slug: id };

    const toolkit = await Toolkit.findOne(query).lean();
    if (!toolkit) {
      return NextResponse.json({ success: false, error: 'Toolkit not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: toolkit });
  } catch (error) {
    console.error('Error fetching toolkit:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch toolkit' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    if (!['admin', 'editor'].includes((session as any).user.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    await connectDB();
    const updates = await request.json();
    updates.updatedBy = (session as any).user.id;
    updates.lastUpdated = new Date();

    const { id } = params;
    const query = isValidObjectId(id) ? { _id: id } : { slug: id };

    const updated = await Toolkit.findOneAndUpdate(query, updates, { new: true }).lean();
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Toolkit not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated, message: 'Toolkit updated' });
  } catch (error) {
    console.error('Error updating toolkit:', error);
    return NextResponse.json({ success: false, error: 'Failed to update toolkit' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    if (!['admin'].includes((session as any).user.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    await connectDB();
    const { id } = params;
    const query = isValidObjectId(id) ? { _id: id } : { slug: id };

    const deleted = await Toolkit.findOneAndDelete(query).lean();
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Toolkit not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Toolkit deleted' });
  } catch (error) {
    console.error('Error deleting toolkit:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete toolkit' }, { status: 500 });
  }
}



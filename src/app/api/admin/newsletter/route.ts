import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getPaginationParams, ApiResponse } from '@/lib/api-utils';
import { getSubscribers } from '@/lib/mailchimp';
import type { ListMember } from '@/lib/mailchimp';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user?.id) {
      return ApiResponse.unauthorized('Authentication required');
    }

    if (!user.role || !['admin', 'editor'].includes(user.role)) {
      return ApiResponse.forbidden('Insufficient permissions');
    }

    const { page, limit } = getPaginationParams(request);
    const { searchParams } = new URL(request.url);
    
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'subscribed';

    if (!process.env.MAILCHIMP_LIST_ID) {
      return ApiResponse.error('Mailchimp not configured', 500);
    }

    try {
      // Get subscribers from Mailchimp
      const result = await getSubscribers(process.env.MAILCHIMP_LIST_ID, {
        status: status as 'subscribed' | 'unsubscribed' | 'cleaned' | 'pending' | undefined,
        count: limit,
        offset: (page - 1) * limit,
        search: search || undefined
      });

      if (!result.success || !result.subscribers) {
        return ApiResponse.error('Failed to fetch subscribers', 500);
      }

      const subscribers = result.subscribers as ListMember[];
      const totalItems = result.total ?? subscribers.length;
      const totalPages = Math.ceil(totalItems / limit) || 1;

      return ApiResponse.success({
        subscribers: subscribers.map(sub => ({
          id: sub.id,
          email: sub.email_address,
          firstName: sub.merge_fields?.FNAME || '',
          lastName: sub.merge_fields?.LNAME || '',
          status: sub.status,
          tags: sub.tags || [],
          subscribedAt: sub.timestamp_signup,
          lastChanged: sub.last_changed,
          memberRating: sub.member_rating
        })),
        pagination: {
          page,
          limit,
          total: totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });

    } catch (error) {
      console.error('Error fetching newsletter subscribers:', error);
      return ApiResponse.error(
        'Failed to fetch newsletter subscribers',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

  } catch (error) {
    console.error('Error in newsletter API:', error);
    return ApiResponse.error(
      'Failed to process request',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}


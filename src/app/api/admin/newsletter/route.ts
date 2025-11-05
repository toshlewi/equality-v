import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
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

    const { page, limit } = getPaginationParams(request);
    const { searchParams } = new URL(request.url);
    
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'subscribed';

    // Import Mailchimp functions
    const { getListMembers, getSubscriberHash } = await import('@/lib/mailchimp');

    if (!process.env.MAILCHIMP_LIST_ID) {
      return ApiResponse.error('Mailchimp not configured', 500);
    }

    try {
      // Get subscribers from Mailchimp
      const result = await getListMembers(process.env.MAILCHIMP_LIST_ID, {
        status: status as 'subscribed' | 'unsubscribed' | 'cleaned' | 'pending' | undefined,
        count: limit,
        offset: (page - 1) * limit
      });

      if (!result.success || !result.members) {
        return ApiResponse.error('Failed to fetch subscribers', 500);
      }

      // Filter by search if provided
      let filteredSubscribers = result.members || [];
      if (search) {
        filteredSubscribers = filteredSubscribers.filter((sub: any) => {
          const email = sub.email_address?.toLowerCase() || '';
          const name = `${sub.merge_fields?.FNAME || ''} ${sub.merge_fields?.LNAME || ''}`.toLowerCase();
          return email.includes(search.toLowerCase()) || name.includes(search.toLowerCase());
        });
      }

      return ApiResponse.success({
        subscribers: filteredSubscribers.map((sub: any) => ({
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
          total: result.totalItems || filteredSubscribers.length,
          totalPages: Math.ceil((result.totalItems || filteredSubscribers.length) / limit),
          hasNextPage: page < Math.ceil((result.totalItems || filteredSubscribers.length) / limit),
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


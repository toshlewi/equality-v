import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Member from '@/models/Member';
import Donation from '@/models/Donation';
import Order from '@/models/Order';
import Article from '@/models/Article';
import Contact from '@/models/Contact';
import Event from '@/models/Event';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has admin access
    if (!['admin', 'editor', 'reviewer', 'finance'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await connectDB();

    // Get current date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get basic counts
    const [
      totalMembers,
      activeMembers,
      totalDonations,
      totalOrders,
      pendingSubmissions,
      upcomingEvents,
      recentContacts,
      monthlyDonations,
      monthlyOrders,
      monthlyMembers
    ] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ isActive: true }),
      Donation.countDocuments({ status: 'completed' }),
      Order.countDocuments({ status: 'confirmed' }),
      Article.countDocuments({ status: 'pending' }),
      Event.countDocuments({ 
        startDate: { $gte: now },
        status: 'published'
      }),
      Contact.countDocuments({ 
        createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
      }),
      Donation.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { status: 'confirmed', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ]),
      Member.countDocuments({ 
        createdAt: { $gte: startOfMonth },
        isActive: true
      })
    ]);

    // Get donation totals
    const donationTotals = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalDonationAmount = donationTotals.length > 0 ? donationTotals[0].total : 0;

    // Get order totals
    const orderTotals = await Order.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const totalOrderAmount = orderTotals.length > 0 ? orderTotals[0].total : 0;

    // Get recent activity
    const recentActivity = await Promise.all([
      Article.find({ status: 'published' })
        .sort({ publishedAt: -1 })
        .limit(5)
        .select('title publishedAt authorName'),
      Donation.find({ status: 'completed' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('amount donorName createdAt'),
      Order.find({ status: 'confirmed' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('orderNumber total customerInfo.name createdAt'),
      Contact.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name subject category createdAt')
    ]);

    // Get monthly growth data for charts
    const monthlyGrowth = await Promise.all([
      Donation.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: startOfLastMonth } } },
        { $group: { 
          _id: { 
            year: { $year: '$createdAt' }, 
            month: { $month: '$createdAt' } 
          }, 
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Order.aggregate([
        { $match: { status: 'confirmed', createdAt: { $gte: startOfLastMonth } } },
        { $group: { 
          _id: { 
            year: { $year: '$createdAt' }, 
            month: { $month: '$createdAt' } 
          }, 
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Member.aggregate([
        { $match: { isActive: true, createdAt: { $gte: startOfLastMonth } } },
        { $group: { 
          _id: { 
            year: { $year: '$createdAt' }, 
            month: { $month: '$createdAt' } 
          }, 
          count: { $sum: 1 }
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    // Calculate growth percentages
    const currentMonthDonations = monthlyDonations.length > 0 ? monthlyDonations[0].total : 0;
    const lastMonthDonations = await Donation.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const lastMonthDonationAmount = lastMonthDonations.length > 0 ? lastMonthDonations[0].total : 0;
    const donationGrowth = lastMonthDonationAmount > 0 
      ? ((currentMonthDonations - lastMonthDonationAmount) / lastMonthDonationAmount) * 100 
      : 0;

    const currentMonthOrders = monthlyOrders.length > 0 ? monthlyOrders[0].total : 0;
    const lastMonthOrders = await Order.aggregate([
      { $match: { status: 'confirmed', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const lastMonthOrderAmount = lastMonthOrders.length > 0 ? lastMonthOrders[0].total : 0;
    const orderGrowth = lastMonthOrderAmount > 0 
      ? ((currentMonthOrders - lastMonthOrderAmount) / lastMonthOrderAmount) * 100 
      : 0;

    const memberGrowth = lastMonthDonationAmount > 0 
      ? ((monthlyMembers - (await Member.countDocuments({ 
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          isActive: true
        }))) / (await Member.countDocuments({ 
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          isActive: true
        }))) * 100 
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalMembers,
          activeMembers,
          totalDonations: totalDonationAmount,
          totalOrders: totalOrderAmount,
          pendingSubmissions,
          upcomingEvents,
          recentContacts
        },
        monthly: {
          donations: {
            total: currentMonthDonations,
            count: monthlyDonations.length > 0 ? monthlyDonations[0].count : 0,
            growth: donationGrowth
          },
          orders: {
            total: currentMonthOrders,
            count: monthlyOrders.length > 0 ? monthlyOrders[0].count : 0,
            growth: orderGrowth
          },
          members: {
            count: monthlyMembers,
            growth: memberGrowth
          }
        },
        charts: {
          donations: monthlyGrowth[0],
          orders: monthlyGrowth[1],
          members: monthlyGrowth[2]
        },
        recentActivity: {
          articles: recentActivity[0],
          donations: recentActivity[1],
          orders: recentActivity[2],
          contacts: recentActivity[3]
        }
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

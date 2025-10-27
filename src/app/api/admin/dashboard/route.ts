import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Member from '@/models/Member';
import Donation from '@/models/Donation';
import Order from '@/models/Order';
import Publication from '@/models/Publication';
import Story from '@/models/Story';
import Event from '@/models/Event';
import Contact from '@/models/Contact';

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

    // Get current date and start of month for calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Overview data
    const [
      totalMembers,
      activeMembers,
      totalDonations,
      totalOrders,
      pendingSubmissions,
      upcomingEvents,
      recentContacts
    ] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ isActive: true }),
      Donation.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Order.aggregate([
        { $match: { status: { $in: ['confirmed', 'shipped', 'delivered'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Story.countDocuments({ status: 'pending' }),
      Event.countDocuments({ 
        startDate: { $gte: now },
        status: 'published'
      }),
      Contact.countDocuments({ 
        createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
      })
    ]);

    // Monthly data
    const [
      monthlyDonations,
      monthlyOrders,
      monthlyMembers,
      lastMonthDonations,
      lastMonthOrders,
      lastMonthMembers
    ] = await Promise.all([
      Donation.aggregate([
        { $match: { 
          status: 'completed',
          createdAt: { $gte: startOfMonth }
        }},
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { 
          status: { $in: ['confirmed', 'shipped', 'delivered'] },
          createdAt: { $gte: startOfMonth }
        }},
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ]),
      Member.countDocuments({ 
        joinDate: { $gte: startOfMonth }
      }),
      Donation.aggregate([
        { $match: { 
          status: 'completed',
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        }},
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { 
          status: { $in: ['confirmed', 'shipped', 'delivered'] },
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        }},
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ]),
      Member.countDocuments({ 
        joinDate: { $gte: startOfLastMonth, $lte: endOfLastMonth }
      })
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const donationsGrowth = calculateGrowth(
      monthlyDonations[0]?.total || 0,
      lastMonthDonations[0]?.total || 0
    );

    const ordersGrowth = calculateGrowth(
      monthlyOrders[0]?.total || 0,
      lastMonthOrders[0]?.total || 0
    );

    const membersGrowth = calculateGrowth(
      monthlyMembers,
      lastMonthMembers
    );

    // Recent activity
    const [recentArticles, recentDonations, recentOrders, recentContactsList] = await Promise.all([
      Publication.find({ status: 'published' })
        .sort({ publishedAt: -1 })
        .limit(5)
        .populate('createdBy', 'name')
        .lean(),
      Donation.find({ status: 'completed' })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Order.find({ status: { $in: ['confirmed', 'shipped', 'delivered'] } })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Contact.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    const dashboardData = {
      overview: {
        totalMembers,
        activeMembers,
        totalDonations: totalDonations[0]?.total || 0,
        totalOrders: totalOrders[0]?.total || 0,
        pendingSubmissions,
        upcomingEvents,
        recentContacts
      },
      monthly: {
        donations: {
          total: monthlyDonations[0]?.total || 0,
          count: monthlyDonations[0]?.count || 0,
          growth: donationsGrowth
        },
        orders: {
          total: monthlyOrders[0]?.total || 0,
          count: monthlyOrders[0]?.count || 0,
          growth: ordersGrowth
        },
        members: {
          count: monthlyMembers,
          growth: membersGrowth
        }
      },
      recentActivity: {
        articles: recentArticles.map(article => ({
          title: article.title,
          authorName: article.createdBy?.name || article.author,
          publishedAt: article.publishedAt || article.createdAt
        })),
        donations: recentDonations.map(donation => ({
          donorName: donation.donorName,
          amount: donation.amount,
          createdAt: donation.createdAt
        })),
        orders: recentOrders.map(order => ({
          orderNumber: order.orderNumber,
          total: order.total,
          status: order.status,
          createdAt: order.createdAt
        })),
        contacts: recentContactsList.map(contact => ({
          name: contact.name,
          email: contact.email,
          subject: contact.subject,
          createdAt: contact.createdAt
        }))
      }
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
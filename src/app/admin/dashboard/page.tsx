"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  DollarSign, 
  ShoppingCart, 
  FileText, 
  Calendar, 
  Mail,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';

interface DashboardData {
  overview: {
    totalMembers: number;
    activeMembers: number;
    totalDonations: number;
    totalOrders: number;
    pendingSubmissions: number;
    upcomingEvents: number;
    recentContacts: number;
  };
  monthly: {
    donations: {
      total: number;
      count: number;
      growth: number;
    };
    orders: {
      total: number;
      count: number;
      growth: number;
    };
    members: {
      count: number;
      growth: number;
    };
  };
  recentActivity: {
    articles: any[];
    donations: any[];
    orders: any[];
    contacts: any[];
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    return (
      <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
        {Math.abs(growth).toFixed(1)}%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
  return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
    </div>
  );
}

  if (!data) return null;

  const overviewCards = [
    {
      title: 'Total Members',
      value: data.overview.totalMembers,
      icon: Users,
      color: 'blue',
      growth: data.monthly.members.growth
    },
    {
      title: 'Active Members',
      value: data.overview.activeMembers,
      icon: Activity,
      color: 'green',
      growth: null
    },
    {
      title: 'Total Donations',
      value: formatCurrency(data.overview.totalDonations),
      icon: DollarSign,
      color: 'purple',
      growth: data.monthly.donations.growth
    },
    {
      title: 'Total Orders',
      value: formatCurrency(data.overview.totalOrders),
      icon: ShoppingCart,
      color: 'orange',
      growth: data.monthly.orders.growth
    },
    {
      title: 'Pending Submissions',
      value: data.overview.pendingSubmissions,
      icon: FileText,
      color: 'yellow',
      growth: null
    },
    {
      title: 'Upcoming Events',
      value: data.overview.upcomingEvents,
      icon: Calendar,
      color: 'indigo',
      growth: null
    },
    {
      title: 'Recent Contacts',
      value: data.overview.recentContacts,
      icon: Mail,
      color: 'pink',
      growth: null
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with Equality Vanguard.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {overviewCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                {card.growth !== null && (
                  <div className="mt-2">
                    {formatGrowth(card.growth)}
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-full bg-${card.color}-100`}>
                <card.icon className={`w-6 h-6 text-${card.color}-600`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month's Donations</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-semibold">{formatCurrency(data.monthly.donations.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Number of Donations</span>
              <span className="font-semibold">{data.monthly.donations.count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Growth</span>
              {formatGrowth(data.monthly.donations.growth)}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month's Orders</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-semibold">{formatCurrency(data.monthly.orders.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Number of Orders</span>
              <span className="font-semibold">{data.monthly.orders.count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Growth</span>
              {formatGrowth(data.monthly.orders.growth)}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month's Members</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">New Members</span>
              <span className="font-semibold">{data.monthly.members.count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Growth</span>
              {formatGrowth(data.monthly.members.growth)}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Articles</h3>
          <div className="space-y-3">
            {data.recentActivity.articles.map((article, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{article.title}</p>
                  <p className="text-sm text-gray-600">by {article.authorName}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(article.publishedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Donations</h3>
          <div className="space-y-3">
            {data.recentActivity.donations.map((donation, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{donation.donorName}</p>
                  <p className="text-sm text-gray-600">{formatCurrency(donation.amount)}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(donation.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
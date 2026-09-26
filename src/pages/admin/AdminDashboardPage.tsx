import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Shirt,
  ArrowRightLeft,
  Flag,
  TrendingUp,
  Leaf,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { AdminStats } from '../../types';
import { api } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const COLORS = ['#315C3A', '#D6A756', '#2A4A32', '#6B8E23', '#A0522D'];

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setIsLoading(true);
        const data = await api.getAdminStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-3 text-sm text-stone-500 font-medium">Loading platform analytics...</p>
      </div>
    );
  }

  const categoryChartData = stats?.categoryDistribution
    ? Object.entries(stats.categoryDistribution).map(([name, value]) => ({ name, value }))
    : [];

  const swapStatusData = stats?.swapsByStatus
    ? Object.entries(stats.swapsByStatus).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-purple-700 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="font-serif text-3xl font-extrabold text-stone-900 mt-1">Platform Analytics</h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Real-time overview of marketplace activity, user safety, and environmental impact.
          </p>
        </div>

        {/* Quick Nav Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/users"
            className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:border-purple-600 hover:text-purple-700 transition-colors shadow-xs"
          >
            Users ({stats?.totalUsers || 0})
          </Link>
          <Link
            to="/admin/listings"
            className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:border-purple-600 hover:text-purple-700 transition-colors shadow-xs"
          >
            Listings ({stats?.totalItems || 0})
          </Link>
          <Link
            to="/admin/reports"
            className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:border-purple-600 hover:text-purple-700 transition-colors shadow-xs"
          >
            Reports ({stats?.pendingReports || 0} Pending)
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Users</span>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <p className="font-serif text-3xl font-extrabold text-stone-900">{stats?.totalUsers || 0}</p>
          <p className="text-[11px] text-stone-500">Active community swappers</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Active Listings</span>
            <Shirt className="w-5 h-5 text-[#315C3A]" />
          </div>
          <p className="font-serif text-3xl font-extrabold text-stone-900">{stats?.totalItems || 0}</p>
          <p className="text-[11px] text-stone-500">Garments in circulation</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Completed Swaps</span>
            <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="font-serif text-3xl font-extrabold text-stone-900">{stats?.completedSwaps || 0}</p>
          <p className="text-[11px] text-emerald-700 font-semibold">
            ~{stats?.estimatedCo2SavedKg || 0} kg CO₂ Prevented
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Safety Reports</span>
            <Flag className="w-5 h-5 text-rose-600" />
          </div>
          <p className="font-serif text-3xl font-extrabold text-stone-900">{stats?.pendingReports || 0}</p>
          <p className="text-[11px] text-rose-600 font-medium">Requires moderation attention</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-stone-900">Wardrobe by Category</h3>
            <span className="text-xs text-stone-400">Garment distribution</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    borderColor: '#e5e7eb',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" fill="#315C3A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Swap Pipeline Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-stone-900">Swap Pipeline Status</h3>
            <span className="text-xs text-stone-400">Transaction volume</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={swapStatusData} layout="vertical">
                <XAxis type="number" stroke="#888888" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#888888" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    borderColor: '#e5e7eb',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" fill="#D6A756" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

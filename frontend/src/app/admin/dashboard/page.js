'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import AdminLayout from '@/components/admin/AdminLayout';
import { Users, Briefcase, Coins, TrendingUp, Award, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, delay = 0, gradient }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="relative group"
  >
    <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
      style={{ background: gradient }} />
    <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          "bg-gradient-to-br shadow-lg"
        )}
          style={{ background: gradient }}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-lg",
            trend === 'up' ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'
          )}>
            {trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {trendValue}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-3xl font-bold text-white">{value}</h3>
        <p className="text-sm text-gray-300">{title}</p>
      </div>
    </div>
  </motion.div>
);

const QuickAction = ({ title, description, icon: Icon, href, delay = 0 }) => (
  <motion.a
    href={href}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    whileHover={{ scale: 1.02, y: -2 }}
    className="block bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group"
  >
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-white mb-1">{title}</h4>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  </motion.a>
);

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalCredits: 0,
    activeInterviews: 0,
    newUsersThisWeek: 0,
    pendingVerifications: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data.role !== 'admin') {
          router.push('/dashboard');
          return;
        }
        setUser(response.data);
        
        // TODO: Fetch real stats from backend
        setStats({
          totalUsers: 1250,
          totalJobs: 450,
          totalCredits: 125000,
          activeInterviews: 34,
          newUsersThisWeek: 87,
          pendingVerifications: 12
        });
      } catch (err) {
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-gray-400">Welcome back, {user?.email}</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={formatNumber(stats.totalUsers)}
            icon={Users}
            trend="up"
            trendValue="+12%"
            delay={0}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
          <StatCard
            title="Active Jobs"
            value={formatNumber(stats.totalJobs)}
            icon={Briefcase}
            trend="up"
            trendValue="+8%"
            delay={0.1}
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          />
          <StatCard
            title="Total Credits"
            value={formatNumber(stats.totalCredits)}
            icon={Coins}
            trend="up"
            trendValue="+15%"
            delay={0.2}
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          />
          <StatCard
            title="Active Interviews"
            value={formatNumber(stats.activeInterviews)}
            icon={Award}
            trend="down"
            trendValue="-3%"
            delay={0.3}
            gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          />
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                <div className="w-2 h-2 rounded-full bg-green-400 mt-2" />
                <div className="flex-1">
                  <p className="text-sm text-white">New user registered</p>
                  <p className="text-xs text-gray-400">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2" />
                <div className="flex-1">
                  <p className="text-sm text-white">Job posted by TechCorp</p>
                  <p className="text-xs text-gray-400">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                <div className="w-2 h-2 rounded-full bg-purple-400 mt-2" />
                <div className="flex-1">
                  <p className="text-sm text-white">Interview completed</p>
                  <p className="text-xs text-gray-400">1 hour ago</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </h2>
            <div className="space-y-3">
              <QuickAction
                title="Manage Users"
                description="View and manage all platform users"
                icon={Users}
                href="/admin/users"
                delay={0.6}
              />
              <QuickAction
                title="Platform Settings"
                description="Configure credit costs and bonuses"
                icon={Activity}
                href="/admin/settings"
                delay={0.7}
              />
              <QuickAction
                title="Create Notification"
                description="Send announcements to users"
                icon={Activity}
                href="/admin/notifications"
                delay={0.8}
              />
            </div>
          </motion.div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          >
            <h3 className="text-sm font-medium text-gray-300 mb-2">New Users This Week</h3>
            <p className="text-3xl font-bold text-white mb-2">{stats.newUsersThisWeek}</p>
            <div className="flex items-center text-sm text-green-400">
              <ArrowUp className="h-4 w-4 mr-1" />
              +23% from last week
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          >
            <h3 className="text-sm font-medium text-gray-300 mb-2">Pending Verifications</h3>
            <p className="text-3xl font-bold text-white mb-2">{stats.pendingVerifications}</p>
            <div className="flex items-center text-sm text-yellow-400">
              <Activity className="h-4 w-4 mr-1" />
              Requires attention
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
          >
            <h3 className="text-sm font-medium text-gray-300 mb-2">Revenue This Month</h3>
            <p className="text-3xl font-bold text-white mb-2">$12,450</p>
            <div className="flex items-center text-sm text-green-400">
              <ArrowUp className="h-4 w-4 mr-1" />
              +18% from last month
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}

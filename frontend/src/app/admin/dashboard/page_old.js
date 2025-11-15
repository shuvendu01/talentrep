'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Briefcase, Users, Coins, TrendingUp, Settings, LogOut, Award, Building } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalCredits: 0,
    verifiedProfiles: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data.role !== 'admin') {
          router.push('/dashboard');
          return;
        }
        setUser(response.data);
        // TODO: Fetch admin stats
      } catch (err) {
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white">
        <div className="p-6">
          <Link href="/" className="flex items-center space-x-2">
            <Briefcase className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold">TalentHub</span>
          </Link>
          <p className="text-sm text-gray-400 mt-2">Admin Panel</p>
        </div>
        
        <nav className="px-4 space-y-2">
          <Link
            href="/admin/dashboard"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-blue-600 text-white"
          >
            <TrendingUp className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Users className="h-5 w-5" />
            <span>Users</span>
          </Link>
          <Link
            href="/admin/jobs"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Briefcase className="h-5 w-5" />
            <span>Jobs</span>
          </Link>
          <Link
            href="/admin/companies"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Building className="h-5 w-5" />
            <span>Companies</span>
          </Link>
          <Link
            href="/admin/credits"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Coins className="h-5 w-5" />
            <span>Credits & Bonuses</span>
          </Link>
          <Link
            href="/admin/verifications"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Award className="h-5 w-5" />
            <span>Verifications</span>
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>Platform Settings</span>
          </Link>
          <Link
            href="/admin/notifications"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Award className="h-5 w-5" />
            <span>Notifications</span>
          </Link>
          <Link
            href="/admin/custom-code"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>Custom CSS/JS</span>
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.email}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
            <p className="text-sm text-gray-600 mt-1">Total Users</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalJobs}</div>
            <p className="text-sm text-gray-600 mt-1">Active Jobs</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.verifiedProfiles}</div>
            <p className="text-sm text-gray-600 mt-1">Verified Profiles</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Coins className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalCredits}</div>
            <p className="text-sm text-gray-600 mt-1">Total Credits</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <p className="text-gray-600">No recent activity</p>
        </div>
      </main>
    </div>
  );
}

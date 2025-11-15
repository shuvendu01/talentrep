'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Award, Coins, LogOut, User, Settings, Briefcase, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function InterviewerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data.role !== 'interviewer') {
          router.push('/dashboard');
          return;
        }
        setUser(response.data);
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
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Award className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">TalentHub</span>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-lg">
              <Coins className="h-5 w-5 text-green-600" />
              <span className="font-medium text-gray-900">{user?.credits_free + user?.credits_paid || 0}</span>
              <span className="text-sm text-gray-600">credits</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back!</h1>
          <p className="text-green-100 text-lg">{user?.email}</p>
          <div className="mt-4 inline-flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
            <Award className="h-5 w-5" />
            <span className="capitalize">Interviewer</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Coins className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Total Credits</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{user?.credits_free + user?.credits_paid || 0}</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Interviews Done</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">0</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">Earned This Month</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">0</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/interviewer/profile"
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 transition-colors group"
            >
              <User className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">My Profile</h3>
              <p className="text-sm text-gray-600">Update your profile & expertise</p>
            </Link>
            <Link
              href="/interview-requests"
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 transition-colors group"
            >
              <Award className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Interview Requests</h3>
              <p className="text-sm text-gray-600">View pending requests</p>
            </Link>
            <Link
              href="/my-interviews"
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 transition-colors group"
            >
              <Briefcase className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">My Interviews</h3>
              <p className="text-sm text-gray-600">Completed interviews</p>
            </Link>
            <Link
              href="/settings"
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 transition-colors group"
            >
              <Settings className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Settings</h3>
              <p className="text-sm text-gray-600">Manage your account</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

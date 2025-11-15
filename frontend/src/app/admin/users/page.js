'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { Users, Search, Eye, Coins, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/exportUtils';

export default function AdminUsersPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await api.get('/auth/me');
        if (userResponse.data.role !== 'admin') {
          router.push('/dashboard');
          return;
        }
        setUser(userResponse.data);
        await fetchUsers();
      } catch (err) {
        console.error('Failed to fetch data:', err);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, page, selectedRole, searchQuery]);

  const fetchUsers = async () => {
    try {
      const params = { page, limit: 20 };
      if (selectedRole) params.role = selectedRole;
      if (searchQuery) params.search = searchQuery;
      
      const response = await api.get('/admin/users', { params });
      setUsers(response.data.users);
      setTotal(response.data.total);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleExport = (format) => {
    const exportData = users.map(u => ({
      Email: u.email,
      Phone: u.phone || 'N/A',
      Role: u.role,
      Credits: (u.credits_free || 0) + (u.credits_paid || 0),
      Status: u.is_active ? 'Active' : 'Inactive',
      Joined: new Date(u.created_at).toLocaleDateString()
    }));

    if (format === 'csv') {
      exportToCSV(exportData, `users_${new Date().toISOString().split('T')[0]}.csv`);
    } else if (format === 'excel') {
      exportToExcel(exportData, `users_${new Date().toISOString().split('T')[0]}.xlsx`, 'Users');
    } else if (format === 'pdf') {
      const columns = [
        { key: 'Email', label: 'Email' },
        { key: 'Role', label: 'Role' },
        { key: 'Credits', label: 'Credits' },
        { key: 'Status', label: 'Status' }
      ];
      exportToPDF(exportData, columns, `users_${new Date().toISOString().split('T')[0]}.pdf`, 'User List');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'jobseeker': return 'from-blue-500 to-cyan-500';
      case 'employer': return 'from-green-500 to-emerald-500';
      case 'interviewer': return 'from-purple-500 to-pink-500';
      case 'admin': return 'from-red-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-gray-400">Manage all platform users</p>
          </div>
          <div className="relative group">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/50">
              <Download className="h-5 w-5" />
              Export
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button onClick={() => handleExport('csv')} className="w-full px-4 py-2 text-left text-white hover:bg-white/10 rounded-t-lg">Export CSV</button>
              <button onClick={() => handleExport('excel')} className="w-full px-4 py-2 text-left text-white hover:bg-white/10">Export Excel</button>
              <button onClick={() => handleExport('pdf')} className="w-full px-4 py-2 text-left text-white hover:bg-white/10 rounded-b-lg">Export PDF</button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input type="text" placeholder="Search by email or phone..." value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <select value={selectedRole} onChange={(e) => { setSelectedRole(e.target.value); setPage(1); }}
              className="w-full md:w-48 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Roles</option>
              <option value="jobseeker">Job Seekers</option>
              <option value="employer">Employers</option>
              <option value="interviewer">Interviewers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Credits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{u.email}</div>
                      {u.phone && <div className="text-sm text-gray-400">{u.phone}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-semibold text-white",
                        `bg-gradient-to-r ${getRoleBadgeColor(u.role)}`
                      )}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm text-white">{(u.credits_free || 0) + (u.credits_paid || 0)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-semibold",
                        u.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      )}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link href={`/admin/users/${u.id}`}
                        className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300">
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No users found</h3>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Pagination */}
          {users.length > 0 && (
            <div className="bg-white/5 px-6 py-3 flex items-center justify-between border-t border-white/10">
              <div className="text-sm text-gray-400">
                Page {page} of {Math.ceil(total / 20)} ({total} total)
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 disabled:opacity-50">
                  Previous
                </button>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

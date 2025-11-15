'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { Lock, Plus, Edit, Trash2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const defaultPermissions = [
  { id: 1, name: 'create_job', description: 'Create new job postings', resource: 'jobs', action: 'create' },
  { id: 2, name: 'edit_job', description: 'Edit existing job postings', resource: 'jobs', action: 'update' },
  { id: 3, name: 'delete_job', description: 'Delete job postings', resource: 'jobs', action: 'delete' },
  { id: 4, name: 'view_jobs', description: 'View job listings', resource: 'jobs', action: 'read' },
  { id: 5, name: 'apply_job', description: 'Apply to job postings', resource: 'applications', action: 'create' },
  { id: 6, name: 'view_applications', description: 'View job applications', resource: 'applications', action: 'read' },
  { id: 7, name: 'reveal_contact', description: 'Reveal job seeker contact information', resource: 'contacts', action: 'read' },
  { id: 8, name: 'request_interview', description: 'Request interview verification', resource: 'interviews', action: 'create' },
  { id: 9, name: 'accept_interview', description: 'Accept interview requests', resource: 'interviews', action: 'update' },
  { id: 10, name: 'submit_rating', description: 'Submit interview ratings', resource: 'ratings', action: 'create' },
  { id: 11, name: 'edit_profile', description: 'Edit user profile', resource: 'profiles', action: 'update' },
  { id: 12, name: 'view_profile', description: 'View user profiles', resource: 'profiles', action: 'read' },
];

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPermissions = permissions.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getActionColor = (action) => {
    switch (action) {
      case 'create': return 'from-green-500 to-emerald-500';
      case 'read': return 'from-blue-500 to-cyan-500';
      case 'update': return 'from-yellow-500 to-orange-500';
      case 'delete': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Permissions
            </h1>
            <p className="text-gray-400">Manage system permissions and actions</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/50">
            <Plus className="h-5 w-5" />
            Add Permission
          </button>
        </div>

        {/* Search */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input type="text" placeholder="Search permissions..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* Permissions Table */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Permission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Resource</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredPermissions.map((permission, index) => (
                <motion.tr key={permission.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium text-white">{permission.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{permission.description}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">{permission.resource}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-semibold text-white",
                      `bg-gradient-to-r ${getActionColor(permission.action)}`
                    )}>
                      {permission.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-1 hover:bg-white/10 rounded transition-all">
                        <Edit className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-red-500/10 rounded transition-all">
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

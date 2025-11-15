'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { Key, Plus, Edit, Trash2, Search, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const defaultResources = [
  { id: 1, name: 'Jobs API', path: '/api/jobs/*', method: 'ALL', protected: true, roles: ['admin', 'employer'] },
  { id: 2, name: 'Applications API', path: '/api/applications/*', method: 'ALL', protected: true, roles: ['admin', 'jobseeker', 'employer'] },
  { id: 3, name: 'Profiles API', path: '/api/profiles/*', method: 'ALL', protected: true, roles: ['all'] },
  { id: 4, name: 'Contacts API', path: '/api/contacts/*', method: 'POST', protected: true, roles: ['admin', 'employer'] },
  { id: 5, name: 'Interviews API', path: '/api/interviews/*', method: 'ALL', protected: true, roles: ['admin', 'jobseeker', 'interviewer'] },
  { id: 6, name: 'Credits API', path: '/api/credits/*', method: 'GET', protected: true, roles: ['all'] },
  { id: 7, name: 'Admin Panel', path: '/admin/*', method: 'ALL', protected: true, roles: ['admin'] },
  { id: 8, name: 'Public Jobs', path: '/jobs', method: 'GET', protected: false, roles: ['all'] },
];

export default function ResourcesPage() {
  const [resources, setResources] = useState(defaultResources);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResources = resources.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return 'from-green-500 to-emerald-500';
      case 'POST': return 'from-blue-500 to-cyan-500';
      case 'PUT': return 'from-yellow-500 to-orange-500';
      case 'DELETE': return 'from-red-500 to-pink-500';
      case 'ALL': return 'from-purple-500 to-indigo-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Protected Resources
            </h1>
            <p className="text-gray-400">Manage API endpoints and protected routes</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/50">
            <Plus className="h-5 w-5" />
            Add Resource
          </button>
        </div>

        {/* Search */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input type="text" placeholder="Search resources..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredResources.map((resource, index) => (
            <motion.div key={resource.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Key className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{resource.name}</h3>
                    <code className="text-xs text-gray-400">{resource.path}</code>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-white/10 rounded transition-all">
                    <Edit className="h-4 w-4 text-gray-400" />
                  </button>
                  <button className="p-1 hover:bg-red-500/10 rounded transition-all">
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-semibold text-white",
                  `bg-gradient-to-r ${getMethodColor(resource.method)}`
                )}>
                  {resource.method}
                </span>
                {resource.protected && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-semibold">
                    <Lock className="h-3 w-3" />
                    Protected
                  </span>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2">Allowed Roles:</p>
                <div className="flex flex-wrap gap-2">
                  {resource.roles.map((role, idx) => (
                    <span key={idx} className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

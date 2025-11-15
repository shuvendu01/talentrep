'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { Shield, Plus, Edit, Trash2, Users, CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const defaultRoles = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    permissions: ['all'],
    userCount: 5,
    color: 'from-red-500 to-pink-500',
    isSystem: true
  },
  {
    id: 'employer',
    name: 'Employer',
    description: 'Can post jobs, view applications, and manage company profile',
    permissions: ['create_job', 'edit_job', 'delete_job', 'view_applications', 'reveal_contact'],
    userCount: 245,
    color: 'from-green-500 to-emerald-500',
    isSystem: true
  },
  {
    id: 'jobseeker',
    name: 'Job Seeker',
    description: 'Can search jobs, apply, and request interviews',
    permissions: ['apply_job', 'request_interview', 'view_jobs', 'edit_profile'],
    userCount: 890,
    color: 'from-blue-500 to-cyan-500',
    isSystem: true
  },
  {
    id: 'interviewer',
    name: 'Interviewer',
    description: 'Can conduct interviews and submit ratings',
    permissions: ['accept_interview', 'submit_rating', 'view_requests'],
    userCount: 34,
    color: 'from-purple-500 to-indigo-500',
    isSystem: true
  }
];

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState(defaultRoles);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Roles Management
            </h1>
            <p className="text-gray-400">Define and manage user roles</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/50"
          >
            <Plus className="h-5 w-5" />
            Create Role
          </button>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br",
                    role.color
                  )}>
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{role.name}</h3>
                    {role.isSystem && (
                      <span className="text-xs text-blue-400">System Role</span>
                    )}
                  </div>
                </div>
                {!role.isSystem && (
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                      <Edit className="h-4 w-4 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-red-500/10 rounded-lg transition-all">
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-300 mb-4">{role.description}</p>

              {/* Permissions */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Permissions:</p>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.slice(0, 3).map((perm, idx) => (
                    <span key={idx} className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                      {perm}
                    </span>
                  ))}
                  {role.permissions.length > 3 && (
                    <span className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                      +{role.permissions.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* User Count */}
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Users className="h-4 w-4" />
                <span>{role.userCount} users</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { Shield, Users, Lock, Key, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACLCard = ({ title, description, icon: Icon, href, count, gradient, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <Link href={href} className="block group">
      <div className="relative">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
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
            {count !== undefined && (
              <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-semibold text-white">
                {count}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-sm text-gray-300">{description}</p>
        </div>
      </div>
    </Link>
  </motion.div>
);

export default function ACLPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (userData.role !== 'admin') {
            router.push('/dashboard');
            return;
          }
          setUser(userData);
        } else {
          router.push('/auth/login');
        }
      } catch (err) {
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
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
            Access Control List (ACL)
          </h1>
          <p className="text-gray-400">Manage roles, permissions, and resource access</p>
        </motion.div>

        {/* ACL Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ACLCard
            title="Roles"
            description="Manage user roles and their base permissions"
            icon={Shield}
            href="/admin/acl/roles"
            count={4}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            delay={0}
          />
          
          <ACLCard
            title="Permissions"
            description="Define specific permissions for actions"
            icon={Lock}
            href="/admin/acl/permissions"
            count={24}
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            delay={0.1}
          />
          
          <ACLCard
            title="Resources"
            description="Manage protected resources and endpoints"
            icon={Key}
            href="/admin/acl/resources"
            count={15}
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            delay={0.2}
          />
        </div>

        {/* Quick Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">Understanding ACL</h2>
          <div className="space-y-3 text-gray-300">
            <p><strong className="text-white">Roles:</strong> Groups that users belong to (Admin, Employer, Job Seeker, Interviewer)</p>
            <p><strong className="text-white">Permissions:</strong> Specific actions that can be performed (create_job, view_profile, etc.)</p>
            <p><strong className="text-white">Resources:</strong> Protected areas of the application (API endpoints, pages, features)</p>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}

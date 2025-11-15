'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building,
  Coins,
  Bell,
  Code,
  Settings,
  LogOut,
  Menu,
  X,
  Award,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
        
        // Try to fetch profile
        if (response.data.role === 'jobseeker') {
          const profileRes = await api.get('/profiles/jobseeker/profile');
          setProfile(profileRes.data);
        } else if (response.data.role === 'employer') {
          const profileRes = await api.get('/profiles/employer/profile');
          setProfile(profileRes.data);
        } else if (response.data.role === 'interviewer') {
          const profileRes = await api.get('/profiles/interviewer/profile');
          setProfile(profileRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };
    fetchUser();
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'ACL', href: '/admin/acl', icon: Shield },
    { name: 'Jobs', href: '/admin/jobs', icon: Briefcase },
    { name: 'Companies', href: '/admin/companies', icon: Building },
    { name: 'Credits', href: '/admin/credits', icon: Coins },
    { name: 'Interviews', href: '/admin/interviews', icon: Award },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell },
    { name: 'Custom Code', href: '/admin/custom-code', icon: Code },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.push('/');
  };

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'AD';
  };

  const getFullName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return user?.email || 'Admin';
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrator',
      jobseeker: 'Job Seeker',
      employer: 'Employer',
      interviewer: 'Interviewer'
    };
    return labels[role] || role;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="fixed left-0 top-0 h-full bg-black/20 backdrop-blur-xl border-r border-white/10 z-40"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xl font-bold text-white"
                >
                  TalentHub
                </motion.span>
              )}
            </Link>
          </div>

          {/* User Profile */}
          {user && sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 border-b border-white/10"
            >
              <div className="flex items-center gap-3">
                {profile?.profile_image_url ? (
                  <img
                    src={profile.profile_image_url}
                    alt={getFullName()}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                    {getInitials()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{getFullName()}</p>
                  <p className="text-xs text-gray-400">{getRoleLabel(user.role)}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer',
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-medium"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/10">
            <motion.button
              whileHover={{ x: 4 }}
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all w-full"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">Logout</span>}
            </motion.button>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white flex items-center justify-center shadow-lg"
        >
          {sidebarOpen ? <X className="h-3 w-3" /> : <Menu className="h-3 w-3" />}
        </button>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        animate={{ marginLeft: sidebarOpen ? 280 : 80 }}
        className="min-h-screen transition-all"
      >
        {children}
      </motion.main>
    </div>
  );
}

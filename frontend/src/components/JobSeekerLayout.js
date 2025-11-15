'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  User,
  Briefcase,
  FileText,
  Award,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Coins
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

export default function JobSeekerLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
        
        const profileRes = await api.get('/profiles/jobseeker/profile');
        setProfile(profileRes.data);

        const creditsRes = await api.get('/credits/balance');
        setCredits(creditsRes.data.total_credits);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };
    fetchUser();
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', href: '/profile', icon: User },
    { name: 'Browse Jobs', href: '/jobs', icon: Briefcase },
    { name: 'My Applications', href: '/applications', icon: FileText },
    { name: 'Verification', href: '/verification', icon: Award },
    { name: 'Interview Requests', href: '/interview-requests', icon: Award },
    { name: 'Settings', href: '/settings', icon: Settings },
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
    return 'JS';
  };

  const getFullName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return user?.email || 'Job Seeker';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            TalentHub
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/credits/transactions" className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
              <Coins className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">{credits}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="lg:hidden fixed inset-y-0 left-0 w-72 bg-black/95 backdrop-blur-xl border-r border-white/10 z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                {profile?.profile_image_url ? (
                  <img src={profile.profile_image_url} alt={getFullName()} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                    {getInitials()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-white">{getFullName()}</p>
                  <p className="text-xs text-gray-400">Job Seeker</p>
                </div>
              </div>

              <nav className="space-y-1">
                {navigation.map((item) => (
                  <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <div className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                      pathname === item.href ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' : 'text-gray-300 hover:bg-white/5'
                    )}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                ))}
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10">
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="hidden lg:block fixed left-0 top-0 h-full bg-black/20 backdrop-blur-xl border-r border-white/10 z-40"
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              {sidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-bold text-white">
                  TalentHub
                </motion.span>
              )}
            </Link>
          </div>

          {user && sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                {profile?.profile_image_url ? (
                  <img src={profile.profile_image_url} alt={getFullName()} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                    {getInitials()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{getFullName()}</p>
                  <p className="text-xs text-gray-400">Job Seeker</p>
                </div>
              </div>
              <Link href="/credits/transactions" className="mt-3 flex items-center justify-between px-3 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                <span className="text-sm text-white font-medium">Credits</span>
                <span className="text-lg font-bold text-white">{credits}</span>
              </Link>
            </motion.div>
          )}

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
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-medium">
                        {item.name}
                      </motion.span>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

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

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white flex items-center justify-center shadow-lg"
        >
          {sidebarOpen ? <X className="h-3 w-3" /> : <Menu className="h-3 w-3" />}
        </button>
      </motion.aside>

      <motion.main
        animate={{ marginLeft: sidebarOpen ? 280 : 80 }}
        className="min-h-screen transition-all hidden lg:block"
      >
        {children}
      </motion.main>

      <main className="lg:hidden min-h-screen">
        {children}
      </main>
    </div>
  );
}

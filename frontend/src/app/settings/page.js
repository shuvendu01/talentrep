'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import JobSeekerLayout from '@/components/JobSeekerLayout';
import { Settings as SettingsIcon, Save, Bell, Lock, DollarSign, MapPin, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [settings, setSettings] = useState({
    email_notifications: true,
    profile_visibility: 'public',
    preferred_locations: '',
    preferred_positions: '',
    expected_salary: '',
    current_salary: '',
    notice_period: '',
    job_alerts: true,
    application_alerts: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (err) {
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await api.put('/profiles/jobseeker/settings', settings);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <JobSeekerLayout>
      <div className="p-8">
        <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Settings</h1>
        <p className="text-gray-400 mb-8">Manage your preferences and job expectations</p>

        {message.text && (
          <div className={cn('mb-6 p-4 rounded-lg', message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')}>
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={settings.email_notifications} onChange={(e) => setSettings({...settings, email_notifications: e.target.checked})} className="w-5 h-5 rounded" />
                <span className="text-gray-300">Email notifications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={settings.job_alerts} onChange={(e) => setSettings({...settings, job_alerts: e.target.checked})} className="w-5 h-5 rounded" />
                <span className="text-gray-300">Job alerts</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={settings.application_alerts} onChange={(e) => setSettings({...settings, application_alerts: e.target.checked})} className="w-5 h-5 rounded" />
                <span className="text-gray-300">Application updates</span>
              </label>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Privacy
            </h2>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Profile Visibility</label>
              <select value={settings.profile_visibility} onChange={(e) => setSettings({...settings, profile_visibility: e.target.value})} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="connections">Connections Only</option>
              </select>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? 'Saving...' : <><Save className="h-5 w-5" />Save Settings</>}
          </button>
        </div>
      </div>
    </JobSeekerLayout>
  );
}

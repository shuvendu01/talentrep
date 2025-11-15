'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import AdminLayout from '@/components/admin/AdminLayout';
import { Settings, Save, Loader2, CheckCircle, X } from 'lucide-react';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [settings, setSettings] = useState({
    contact_reveal_cost: 10000,
    contact_access_duration_days: 365,
    interview_request_cost: 5000,
    interview_completion_earning: 500,
    interviewer_certification_cost: 0,
    jobseeker_signup_bonus: 200,
    employer_signup_bonus: 10000,
    interviewer_signup_bonus: 500
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await api.get('/auth/me');
        if (userResponse.data.role !== 'admin') {
          router.push('/dashboard');
          return;
        }
        setUser(userResponse.data);

        const settingsResponse = await api.get('/credits/settings');
        setSettings(settingsResponse.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/credits/settings', settings);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: parseInt(value) || 0 });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Platform Settings
        </h1>
        <p className="text-gray-400 mb-8">Configure credit costs, bonuses, and platform parameters</p>
        
        <div className="max-w-4xl">
        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 backdrop-blur-xl border ${
            message.type === 'success' 
              ? 'bg-green-500/10 text-green-400 border-green-500/20' 
              : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mt-0.5" />
            ) : (
              <X className="h-5 w-5 mt-0.5" />
            )}
            <p>{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Contact Reveal Settings */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Contact Reveal Settings
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cost to Reveal Contact (Credits)
                </label>
                <input
                  type="number"
                  value={settings.contact_reveal_cost}
                  onChange={(e) => handleChange('contact_reveal_cost', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
                <p className="mt-1 text-sm text-gray-500">Credits charged to employers to reveal job seeker contact</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Duration (Days)
                </label>
                <input
                  type="number"
                  value={settings.contact_access_duration_days}
                  onChange={(e) => handleChange('contact_access_duration_days', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                />
                <p className="mt-1 text-sm text-gray-500">How long employer has access after purchase (365 = 1 year)</p>
              </div>
            </div>
          </div>

          {/* Interview Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Interview Verification Settings
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Request Cost (Credits)
                </label>
                <input
                  type="number"
                  value={settings.interview_request_cost}
                  onChange={(e) => handleChange('interview_request_cost', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
                <p className="mt-1 text-sm text-gray-500">Credits charged to job seekers for interview verification</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Completion Earning (Credits)
                </label>
                <input
                  type="number"
                  value={settings.interview_completion_earning}
                  onChange={(e) => handleChange('interview_completion_earning', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
                <p className="mt-1 text-sm text-gray-500">Credits earned by interviewers per completed interview</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interviewer Certification Cost (Credits)
                </label>
                <input
                  type="number"
                  value={settings.interviewer_certification_cost}
                  onChange={(e) => handleChange('interviewer_certification_cost', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
                <p className="mt-1 text-sm text-gray-500">Credits to become certified interviewer (0 = free)</p>
              </div>
            </div>
          </div>

          {/* Signup Bonus Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Signup Bonus Settings
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Seeker Signup Bonus (Credits)
                </label>
                <input
                  type="number"
                  value={settings.jobseeker_signup_bonus}
                  onChange={(e) => handleChange('jobseeker_signup_bonus', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employer Signup Bonus (Credits)
                </label>
                <input
                  type="number"
                  value={settings.employer_signup_bonus}
                  onChange={(e) => handleChange('employer_signup_bonus', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interviewer Signup Bonus (Credits)
                </label>
                <input
                  type="number"
                  value={settings.interviewer_signup_bonus}
                  onChange={(e) => handleChange('interviewer_signup_bonus', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      </div>
    </AdminLayout>
  );
}

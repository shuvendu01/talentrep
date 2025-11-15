'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Building, Loader2, CheckCircle, X, Save, Search } from 'lucide-react';
import Link from 'next/link';

export default function EmployerProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [companySuggestions, setCompanySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [formData, setFormData] = useState({
    company_name: '',
    location: '',
    contact_person_name: '',
    contact_person_designation: '',
    company_website: '',
    company_size: '',
    industry: '',
    about: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userResponse = await api.get('/auth/me');
      setUser(userResponse.data);
      
      if (userResponse.data.role !== 'employer') {
        router.push('/dashboard');
        return;
      }

      try {
        const profileResponse = await api.get('/profiles/employer/profile');
        setProfile(profileResponse.data);
        setFormData({
          company_name: profileResponse.data.company_name || '',
          location: profileResponse.data.location || '',
          contact_person_name: profileResponse.data.contact_person_name || '',
          contact_person_designation: profileResponse.data.contact_person_designation || '',
          company_website: profileResponse.data.company_website || '',
          company_size: profileResponse.data.company_size || '',
          industry: profileResponse.data.industry || '',
          about: profileResponse.data.about || '',
        });
      } catch (err) {
        if (err.response?.status === 404) {
          setIsEditing(true);
        }
      }
    } catch (err) {
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanySuggestions = async (query) => {
    if (query.length < 2) {
      setCompanySuggestions([]);
      return;
    }

    try {
      const response = await api.get(`/profiles/companies/suggest?query=${encodeURIComponent(query)}`);
      setCompanySuggestions(response.data.companies || []);
    } catch (err) {
      console.error('Failed to fetch company suggestions:', err);
    }
  };

  const handleCompanyNameChange = (value) => {
    setFormData({ ...formData, company_name: value });
    fetchCompanySuggestions(value);
    setShowSuggestions(true);
  };

  const selectCompany = (companyName) => {
    setFormData({ ...formData, company_name: companyName });
    setShowSuggestions(false);
    setCompanySuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      if (profile) {
        await api.put('/profiles/employer/profile', formData);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        await api.post('/profiles/employer/profile', formData);
        setMessage({ type: 'success', text: 'Profile created successfully!' });
      }
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/employer/dashboard" className="flex items-center space-x-2">
            <Building className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">TalentHub</span>
          </Link>
          <Link href="/employer/dashboard" className="text-gray-600 hover:text-purple-600 transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
            {profile && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <X className="h-5 w-5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name with Auto-suggest */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  value={formData.company_name}
                  onChange={(e) => handleCompanyNameChange(e.target.value)}
                  onFocus={() => formData.company_name.length >= 2 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Start typing company name..."
                />
                {isEditing && <Search className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />}
              </div>
              
              {/* Suggestions Dropdown */}
              {isEditing && showSuggestions && companySuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {companySuggestions.map((company, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectCompany(company.name)}
                      className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors border-b last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{company.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{company.category}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Mumbai, India"
                />
              </div>

              {/* Contact Person Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person Name *</label>
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  value={formData.contact_person_name}
                  onChange={(e) => setFormData({ ...formData, contact_person_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Designation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.contact_person_designation}
                  onChange={(e) => setFormData({ ...formData, contact_person_designation: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="HR Manager"
                />
              </div>

              {/* Company Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Website</label>
                <input
                  type="url"
                  disabled={!isEditing}
                  value={formData.company_website}
                  onChange={(e) => setFormData({ ...formData, company_website: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="https://company.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Company Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                <select
                  disabled={!isEditing}
                  value={formData.company_size}
                  onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Technology, Healthcare, etc."
                />
              </div>
            </div>

            {/* About Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">About Company</label>
              <textarea
                disabled={!isEditing}
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Tell us about your company, culture, and what makes it special..."
              />
            </div>

            {isEditing && (
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>Save Profile</span>
                    </>
                  )}
                </button>
                {profile && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile();
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}

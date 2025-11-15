'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Award, Loader2, CheckCircle, X, Save, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function InterviewerProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    headline: '',
    location: '',
    years_of_experience: 0,
    expertise_areas: [],
    secondary_expertise: [],
  });

  const [newExpertise, setNewExpertise] = useState('');
  const [newSecondaryExpertise, setNewSecondaryExpertise] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userResponse = await api.get('/auth/me');
      setUser(userResponse.data);
      
      if (userResponse.data.role !== 'interviewer') {
        router.push('/dashboard');
        return;
      }

      try {
        const profileResponse = await api.get('/profiles/interviewer/profile');
        setProfile(profileResponse.data);
        setFormData({
          full_name: profileResponse.data.full_name || '',
          headline: profileResponse.data.headline || '',
          location: profileResponse.data.location || '',
          years_of_experience: profileResponse.data.years_of_experience || 0,
          expertise_areas: profileResponse.data.expertise_areas || [],
          secondary_expertise: profileResponse.data.secondary_expertise || [],
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      if (profile) {
        await api.put('/profiles/interviewer/profile', formData);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        await api.post('/profiles/interviewer/profile', formData);
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

  const addExpertise = () => {
    if (newExpertise.trim() && !formData.expertise_areas.includes(newExpertise.trim())) {
      setFormData({
        ...formData,
        expertise_areas: [...formData.expertise_areas, newExpertise.trim()]
      });
      setNewExpertise('');
    }
  };

  const removeExpertise = (skill) => {
    setFormData({
      ...formData,
      expertise_areas: formData.expertise_areas.filter(s => s !== skill)
    });
  };

  const addSecondaryExpertise = () => {
    if (newSecondaryExpertise.trim() && !formData.secondary_expertise.includes(newSecondaryExpertise.trim())) {
      setFormData({
        ...formData,
        secondary_expertise: [...formData.secondary_expertise, newSecondaryExpertise.trim()]
      });
      setNewSecondaryExpertise('');
    }
  };

  const removeSecondaryExpertise = (skill) => {
    setFormData({
      ...formData,
      secondary_expertise: formData.secondary_expertise.filter(s => s !== skill)
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/interviewer/dashboard" className="flex items-center space-x-2">
            <Award className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">TalentHub</span>
          </Link>
          <Link href="/interviewer/dashboard" className="text-gray-600 hover:text-green-600 transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Interviewer Profile</h1>
              {profile && profile.is_certified && (
                <div className="flex items-center space-x-2 mt-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Certified Interviewer</span>
                </div>
              )}
            </div>
            {profile && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
            <div className="grid md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="John Doe"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Mumbai, India"
                />
              </div>
            </div>

            {/* Headline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Professional Headline</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Senior Technical Interviewer | Full Stack Expert"
              />
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
              <input
                type="number"
                step="0.5"
                min="0"
                required
                disabled={!isEditing}
                value={formData.years_of_experience}
                onChange={(e) => setFormData({ ...formData, years_of_experience: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            {/* Primary Expertise */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Expertise Areas *</label>
              <p className="text-sm text-gray-600 mb-3">Skills you can conduct primary assessments for</p>
              
              {isEditing && (
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newExpertise}
                    onChange={(e) => setNewExpertise(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., React, Node.js, Python"
                  />
                  <button
                    type="button"
                    onClick={addExpertise}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {formData.expertise_areas.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg">
                    <span>{skill}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeExpertise(skill)}
                        className="hover:text-green-900"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                {formData.expertise_areas.length === 0 && (
                  <p className="text-gray-500 text-sm">No primary expertise added yet</p>
                )}
              </div>
            </div>

            {/* Secondary Expertise */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Expertise Areas</label>
              <p className="text-sm text-gray-600 mb-3">Additional skills you can assess</p>
              
              {isEditing && (
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSecondaryExpertise}
                    onChange={(e) => setNewSecondaryExpertise(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSecondaryExpertise())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., MongoDB, AWS, Docker"
                  />
                  <button
                    type="button"
                    onClick={addSecondaryExpertise}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {formData.secondary_expertise.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg">
                    <span>{skill}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeSecondaryExpertise(skill)}
                        className="hover:text-gray-900"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                {formData.secondary_expertise.length === 0 && (
                  <p className="text-gray-500 text-sm">No secondary expertise added yet</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saving || formData.expertise_areas.length === 0}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
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

          {/* Certification Status */}
          {profile && (
            <div className="mt-8 pt-8 border-t">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Certification Status</h2>
              {profile.is_certified ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <span className="font-medium text-green-900">You are a certified interviewer</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Interviews conducted: {profile.interviews_conducted || 0}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 mb-2">
                    <strong>Pending Certification:</strong> You need to be verified by a certified interviewer or admin to start conducting interviews.
                  </p>
                  <p className="text-sm text-yellow-700">
                    Once certified, you'll be able to accept interview requests and earn 500 credits per interview.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

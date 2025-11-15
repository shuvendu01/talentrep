'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { ArrowLeft, Coins, Gift, Plus, Minus, CheckCircle, X, User, Mail, Phone, Calendar, Building } from 'lucide-react';

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id;
  
  const [currentUser, setCurrentUser] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donating, setDonating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [donateForm, setDonateForm] = useState({
    amount: 100,
    reason: '',
    send_notification: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await api.get('/auth/me');
        if (userResponse.data.role !== 'admin') {
          router.push('/dashboard');
          return;
        }
        setCurrentUser(userResponse.data);

        const detailResponse = await api.get(`/admin/users/${userId}`);
        setUser(detailResponse.data.user);
        setProfile(detailResponse.data.profile);

        const donationsResponse = await api.get(`/admin/users/${userId}/donations`);
        setDonations(donationsResponse.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        router.push('/admin/users');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, userId]);

  const handleDonate = async (e) => {
    e.preventDefault();
    setDonating(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post(`/admin/users/${userId}/donate-credits`, {
        user_id: userId,
        ...donateForm
      });
      
      setMessage({ type: 'success', text: 'Credits donated successfully!' });
      setShowDonateModal(false);
      setDonateForm({ amount: 100, reason: '', send_notification: true });
      
      // Refresh data
      const detailResponse = await api.get(`/admin/users/${userId}`);
      setUser(detailResponse.data.user);
      
      const donationsResponse = await api.get(`/admin/users/${userId}/donations`);
      setDonations(donationsResponse.data);
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to donate credits' });
    } finally {
      setDonating(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'jobseeker':
        return 'bg-blue-100 text-blue-700';
      case 'employer':
        return 'bg-green-100 text-green-700';
      case 'interviewer':
        return 'bg-purple-100 text-purple-700';
      case 'admin':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className=\"min-h-screen flex items-center justify-center\">
        <div className=\"animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600\"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className=\"min-h-screen flex items-center justify-center\">
        <div className=\"text-center\">
          <h2 className=\"text-2xl font-bold text-gray-900 mb-2\">User not found</h2>
          <Link href=\"/admin/users\" className=\"text-blue-600 hover:text-blue-700\">
            ← Back to users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className=\"min-h-screen bg-gray-50\">
      {/* Header */}
      <div className=\"bg-white border-b\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
          <div className=\"flex justify-between items-center py-4\">
            <div className=\"flex items-center gap-4\">
              <Link href=\"/admin/users\" className=\"text-gray-600 hover:text-blue-600\">
                <ArrowLeft className=\"h-6 w-6\" />
              </Link>
              <h1 className=\"text-2xl font-bold text-gray-900\">User Details</h1>
            </div>
            <button
              onClick={() => setShowDonateModal(true)}
              className=\"px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2\"
            >
              <Gift className=\"h-5 w-5\" />
              Donate Credits
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8\">
        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className=\"h-5 w-5 mt-0.5\" />
            ) : (
              <X className=\"h-5 w-5 mt-0.5\" />
            )}
            <p>{message.text}</p>
          </div>
        )}

        <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-6\">
          {/* User Info */}
          <div className=\"lg:col-span-2 space-y-6\">
            {/* Basic Info */}
            <div className=\"bg-white rounded-lg shadow-md p-6\">
              <h2 className=\"text-xl font-bold text-gray-900 mb-4\">Basic Information</h2>
              <div className=\"space-y-3\">
                <div className=\"flex items-center gap-3\">
                  <Mail className=\"h-5 w-5 text-gray-400\" />
                  <span className=\"text-gray-700\">{user.email}</span>
                </div>
                {user.phone && (
                  <div className=\"flex items-center gap-3\">
                    <Phone className=\"h-5 w-5 text-gray-400\" />
                    <span className=\"text-gray-700\">{user.phone}</span>
                  </div>
                )}
                <div className=\"flex items-center gap-3\">
                  <User className=\"h-5 w-5 text-gray-400\" />
                  <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                <div className=\"flex items-center gap-3\">
                  <Calendar className=\"h-5 w-5 text-gray-400\" />
                  <span className=\"text-gray-700\">Joined {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
                {user.last_login && (
                  <div className=\"flex items-center gap-3\">
                    <Calendar className=\"h-5 w-5 text-gray-400\" />
                    <span className=\"text-gray-700\">Last login: {new Date(user.last_login).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            {profile && (
              <div className=\"bg-white rounded-lg shadow-md p-6\">
                <h2 className=\"text-xl font-bold text-gray-900 mb-4\">Profile Information</h2>
                <div className=\"space-y-3\">
                  {profile.first_name && (
                    <div>
                      <span className=\"text-sm font-medium text-gray-500\">Name:</span>
                      <p className=\"text-gray-900\">{profile.first_name} {profile.last_name}</p>
                    </div>
                  )}
                  {profile.company_name && (
                    <div className=\"flex items-start gap-3\">
                      <Building className=\"h-5 w-5 text-gray-400 mt-1\" />
                      <div>
                        <span className=\"text-sm font-medium text-gray-500\">Company:</span>
                        <p className=\"text-gray-900\">{profile.company_name}</p>
                      </div>
                    </div>
                  )}
                  {profile.headline && (
                    <div>
                      <span className=\"text-sm font-medium text-gray-500\">Headline:</span>
                      <p className=\"text-gray-900\">{profile.headline}</p>
                    </div>
                  )}
                  {profile.about && (
                    <div>
                      <span className=\"text-sm font-medium text-gray-500\">About:</span>
                      <p className=\"text-gray-700 whitespace-pre-line\">{profile.about}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Donation History */}
            <div className=\"bg-white rounded-lg shadow-md p-6\">
              <h2 className=\"text-xl font-bold text-gray-900 mb-4\">Credit Donation History</h2>
              {donations.length > 0 ? (
                <div className=\"space-y-3\">
                  {donations.map((donation) => (
                    <div key={donation.id} className=\"border-l-4 border-green-500 pl-4 py-2\">
                      <div className=\"flex justify-between items-start\">
                        <div>
                          <div className=\"flex items-center gap-2 mb-1\">
                            <Coins className=\"h-4 w-4 text-yellow-500\" />
                            <span className=\"font-semibold text-gray-900\">+{donation.amount} credits</span>
                          </div>
                          {donation.reason && (
                            <p className=\"text-sm text-gray-600\">{donation.reason}</p>
                          )}
                        </div>
                        <span className=\"text-xs text-gray-500\">
                          {new Date(donation.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className=\"text-gray-500 text-center py-4\">No donations yet</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className=\"space-y-6\">
            {/* Credits Card */}
            <div className=\"bg-white rounded-lg shadow-md p-6\">
              <h3 className=\"text-lg font-bold text-gray-900 mb-4 flex items-center gap-2\">
                <Coins className=\"h-5 w-5 text-yellow-500\" />
                Credit Balance
              </h3>
              <div className=\"space-y-3\">
                <div className=\"flex justify-between items-center\">
                  <span className=\"text-gray-600\">Free Credits:</span>
                  <span className=\"text-2xl font-bold text-green-600\">{user.credits_free || 0}</span>
                </div>
                <div className=\"flex justify-between items-center\">
                  <span className=\"text-gray-600\">Paid Credits:</span>
                  <span className=\"text-2xl font-bold text-blue-600\">{user.credits_paid || 0}</span>
                </div>
                <div className=\"pt-3 border-t border-gray-200\">
                  <div className=\"flex justify-between items-center\">
                    <span className=\"font-medium text-gray-900\">Total:</span>
                    <span className=\"text-3xl font-bold text-gray-900\">
                      {(user.credits_free || 0) + (user.credits_paid || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className=\"bg-white rounded-lg shadow-md p-6\">
              <h3 className=\"text-lg font-bold text-gray-900 mb-4\">Account Status</h3>
              <div className=\"space-y-3\">
                <div className=\"flex justify-between items-center\">
                  <span className=\"text-gray-600\">Active:</span>
                  <span className={`px-2 py-1 rounded text-sm font-semibold ${
                    user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {user.is_active ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className=\"flex justify-between items-center\">
                  <span className=\"text-gray-600\">Verified:</span>
                  <span className={`px-2 py-1 rounded text-sm font-semibold ${
                    user.is_verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.is_verified ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className=\"bg-white rounded-lg shadow-md p-6\">
              <h3 className=\"text-lg font-bold text-gray-900 mb-4\">Quick Actions</h3>
              <div className=\"space-y-2\">
                <Link
                  href={`/admin/credits?user_id=${userId}`}
                  className=\"block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-center\"
                >
                  View Transactions
                </Link>
                <button
                  onClick={() => setShowDonateModal(true)}
                  className=\"w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700\"
                >
                  Donate Credits
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donate Modal */}
      {showDonateModal && (
        <div className=\"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4\">
          <div className=\"bg-white rounded-lg shadow-xl max-w-md w-full\">
            <div className=\"p-6\">
              <div className=\"flex justify-between items-center mb-6\">
                <h2 className=\"text-2xl font-bold text-gray-900 flex items-center gap-2\">
                  <Gift className=\"h-6 w-6\" />
                  Donate Credits
                </h2>
                <button onClick={() => setShowDonateModal(false)} className=\"text-gray-400 hover:text-gray-600\">
                  <X className=\"h-6 w-6\" />
                </button>
              </div>

              <form onSubmit={handleDonate} className=\"space-y-4\">
                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-2\">Amount (Credits)</label>
                  <input
                    type=\"number\"
                    value={donateForm.amount}
                    onChange={(e) => setDonateForm({ ...donateForm, amount: parseInt(e.target.value) || 0 })}
                    className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500\"
                    min=\"1\"
                    required
                  />
                </div>

                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-2\">Reason (Optional)</label>
                  <textarea
                    value={donateForm.reason}
                    onChange={(e) => setDonateForm({ ...donateForm, reason: e.target.value })}
                    className=\"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500\"
                    rows={3}
                    placeholder=\"Promotional bonus, performance reward, etc.\"
                  />
                </div>

                <div className=\"flex items-center gap-2\">
                  <input
                    type=\"checkbox\"
                    checked={donateForm.send_notification}
                    onChange={(e) => setDonateForm({ ...donateForm, send_notification: e.target.checked })}
                    className=\"rounded\"
                  />
                  <span className=\"text-sm text-gray-700\">Send notification to user</span>
                </div>

                <div className=\"flex justify-end gap-4 pt-4\">
                  <button
                    type=\"button\"
                    onClick={() => setShowDonateModal(false)}
                    className=\"px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50\"
                  >
                    Cancel
                  </button>
                  <button
                    type=\"submit\"
                    disabled={donating}
                    className=\"px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2\"
                  >
                    {donating ? (
                      <>
                        <div className=\"animate-spin rounded-full h-4 w-4 border-b-2 border-white\"></div>
                        Donating...
                      </>
                    ) : (
                      <>
                        <Gift className=\"h-4 w-4\" />
                        Donate {donateForm.amount} Credits
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

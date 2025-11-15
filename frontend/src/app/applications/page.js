'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { 
  Briefcase, 
  MapPin, 
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Hourglass,
  Eye,
  FileText
} from 'lucide-react';

export default function MyApplicationsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await api.get('/auth/me');
        if (userResponse.data.role !== 'jobseeker') {
          router.push('/dashboard');
          return;
        }
        setUser(userResponse.data);

        const appsResponse = await api.get('/jobs/applications/my-applications');
        setApplications(appsResponse.data || []);
      } catch (err) {
        console.error('Failed to fetch applications:', err);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
      default:
        return <Hourglass className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'pending':
      default:
        return 'Under Review';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              TalentHub
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/jobs" className="text-gray-600 hover:text-blue-600 transition-colors">
                Browse Jobs
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-blue-600 transition-colors">
                Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-gray-600">Track and manage your job applications</p>
        </div>

        {/* Applications Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
              </div>
              <Briefcase className="h-12 w-12 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Under Review</p>
                <p className="text-3xl font-bold text-gray-900">
                  {applications.filter(app => app.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-12 w-12 text-yellow-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Accepted</p>
                <p className="text-3xl font-bold text-gray-900">
                  {applications.filter(app => app.status === 'accepted').length}
                </p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600 mb-6">Start applying to jobs to track your applications here</p>
            <Link 
              href="/jobs" 
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div 
                key={application.id} 
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Job Details */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <Link 
                            href={`/jobs/${application.job_id}`}
                            className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2 inline-block"
                          >
                            {application.job_title || 'Job Title'}
                          </Link>
                          
                          <div className="flex flex-wrap gap-4 text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Building2 className="h-4 w-4 mr-2" />
                              <span>{application.company_name || 'Company'}</span>
                            </div>
                            {application.location && (
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span>{application.location}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Applied {formatDate(application.applied_at)}</span>
                          </div>

                          {/* Cover Letter Preview */}
                          {application.cover_letter && (
                            <details className="mt-4">
                              <summary className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                View Cover Letter
                              </summary>
                              <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-700 whitespace-pre-line">
                                  {application.cover_letter}
                                </p>
                              </div>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col items-end gap-2">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="font-semibold">{getStatusLabel(application.status)}</span>
                      </div>
                      
                      <Link
                        href={`/jobs/${application.job_id}`}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View Job
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

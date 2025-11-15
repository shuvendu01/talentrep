'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { 
  Briefcase, 
  MapPin, 
  Calendar,
  Users,
  Eye,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  X,
  DollarSign,
  Clock
} from 'lucide-react';

export default function EmployerJobsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [deletingJobId, setDeletingJobId] = useState(null);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await api.get('/auth/me');
        if (userResponse.data.role !== 'employer') {
          router.push('/dashboard');
          return;
        }
        setUser(userResponse.data);

        await fetchJobs();
      } catch (err) {
        console.error('Failed to fetch data:', err);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/my-jobs');
      setJobs(response.data || []);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setMessage({ type: 'error', text: 'Failed to load jobs' });
    }
  };

  const handleDelete = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    setDeletingJobId(jobId);
    setMessage({ type: '', text: '' });

    try {
      await api.delete(`/jobs/jobs/${jobId}`);
      setMessage({ type: 'success', text: 'Job deleted successfully' });
      await fetchJobs();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to delete job' });
    } finally {
      setDeletingJobId(null);
    }
  };

  const viewApplications = async (job) => {
    setSelectedJob(job);
    setShowApplicationsModal(true);
    setLoadingApplications(true);
    
    try {
      const response = await api.get(`/jobs/applications/job/${job.id}`);
      setApplications(response.data || []);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setMessage({ type: 'error', text: 'Failed to load applications' });
    } finally {
      setLoadingApplications(false);
    }
  };

  const getJobTypeLabel = (type) => {
    const labels = {
      'full-time': 'Full Time',
      'part-time': 'Part Time',
      'contract': 'Contract',
      'internship': 'Internship',
      'freelance': 'Freelance'
    };
    return labels[type] || type;
  };

  const getWorkModeLabel = (mode) => {
    const labels = {
      'onsite': 'On-site',
      'remote': 'Remote',
      'hybrid': 'Hybrid'
    };
    return labels[mode] || mode;
  };

  const formatSalary = (min, max) => {
    if (min && max) {
      return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    }
    if (min) {
      return `$${(min / 1000).toFixed(0)}k+`;
    }
    return 'Not specified';
  };

  const getFreshnessLabel = (days) => {
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
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
              <Link href="/employer/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
              <Link href="/employer/profile" className="text-gray-600 hover:text-blue-600 transition-colors">
                Profile
              </Link>
              <Link 
                href="/post-job" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Post Job
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Job Postings</h1>
          <p className="text-gray-600">Manage your job listings and view applications</p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mt-0.5" />
            ) : (
              <X className="h-5 w-5 mt-0.5" />
            )}
            <p>{message.text}</p>
          </div>
        )}

        {/* Jobs Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Jobs</p>
                <p className="text-3xl font-bold text-gray-900">{jobs.length}</p>
              </div>
              <Briefcase className="h-12 w-12 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active</p>
                <p className="text-3xl font-bold text-gray-900">
                  {jobs.filter(job => job.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">
                  {jobs.reduce((sum, job) => sum + (job.applications_count || 0), 0)}
                </p>
              </div>
              <Users className="h-12 w-12 text-purple-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Views</p>
                <p className="text-3xl font-bold text-gray-900">
                  {jobs.reduce((sum, job) => sum + (job.views_count || 0), 0)}
                </p>
              </div>
              <Eye className="h-12 w-12 text-orange-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No job postings yet</h3>
            <p className="text-gray-600 mb-6">Create your first job posting to start receiving applications</p>
            <Link 
              href="/post-job" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              <Plus className="h-5 w-5" />
              Post a Job
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div 
                key={job.id} 
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Job Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <Link 
                          href={`/jobs/${job.id}`}
                          className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {job.job_title}
                        </Link>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          job.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {job.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-gray-600 mb-3">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2" />
                          <span>{getJobTypeLabel(job.job_type)} • {getWorkModeLabel(job.work_mode)}</span>
                        </div>
                        {job.min_salary && (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            <span>{formatSalary(job.min_salary, job.max_salary)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Posted {getFreshnessLabel(job.freshness_days)}</span>
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          <span>{job.views_count || 0} views</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{job.applications_count || 0} applications</span>
                        </div>
                      </div>

                      {/* Skills */}
                      {job.required_skills && job.required_skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {job.required_skills.slice(0, 5).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.required_skills.length > 5 && (
                            <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs">
                              +{job.required_skills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 lg:min-w-[180px]">
                      <button
                        onClick={() => viewApplications(job)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
                      >
                        <Users className="h-4 w-4" />
                        View Applications
                      </button>
                      
                      <Link
                        href={`/jobs/${job.id}`}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
                      >
                        <Eye className="h-4 w-4" />
                        View Job
                      </Link>

                      <button
                        onClick={() => handleDelete(job.id)}
                        disabled={deletingJobId === job.id}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingJobId === job.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Applications Modal */}
      {showApplicationsModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Applications for {selectedJob.job_title}
                  </h2>
                  <p className="text-gray-600">
                    {applications.length} {applications.length === 1 ? 'application' : 'applications'}
                  </p>
                </div>
                <button
                  onClick={() => setShowApplicationsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {loadingApplications ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications yet</h3>
                  <p className="text-gray-600">Applications will appear here when job seekers apply</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div 
                      key={application.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Job Seeker ID: {application.job_seeker_id}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Applied on {formatDate(application.applied_at)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          application.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : application.status === 'accepted'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {application.status}
                        </span>
                      </div>

                      {application.cover_letter && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-2">Cover Letter:</p>
                          <p className="text-sm text-gray-600 whitespace-pre-line">
                            {application.cover_letter}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

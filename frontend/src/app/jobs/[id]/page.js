'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  DollarSign, 
  Building2,
  Calendar,
  Users,
  Eye,
  ChevronLeft,
  CheckCircle,
  X,
  Send
} from 'lucide-react';

export default function JobDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id;
  
  const [user, setUser] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user
        try {
          const userResponse = await api.get('/auth/me');
          setUser(userResponse.data);
          
          // Check if already applied
          if (userResponse.data.role === 'jobseeker') {
            checkApplicationStatus();
          }
        } catch (err) {
          console.log('User not logged in');
        }

        // Fetch job details
        const jobResponse = await api.get(`/jobs/jobs/${jobId}`);
        setJob(jobResponse.data);
      } catch (err) {
        console.error('Failed to fetch job details:', err);
        setMessage({ type: 'error', text: 'Job not found' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  const checkApplicationStatus = async () => {
    try {
      const response = await api.get('/jobs/applications/my-applications');
      const applications = response.data;
      const applied = applications.some(app => app.job_id === jobId);
      setHasApplied(applied);
    } catch (err) {
      console.error('Failed to check application status:', err);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    
    if (!user) {
      router.push(`/auth/login?redirect=/jobs/${jobId}`);
      return;
    }

    if (user.role !== 'jobseeker') {
      setMessage({ type: 'error', text: 'Only job seekers can apply for jobs' });
      return;
    }

    setApplying(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/jobs/applications', {
        job_id: jobId,
        cover_letter: coverLetter
      });

      setMessage({ type: 'success', text: 'Application submitted successfully!' });
      setHasApplied(true);
      setShowApplyModal(false);
      setCoverLetter('');
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to submit application' 
      });
    } finally {
      setApplying(false);
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
      return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k per year`;
    }
    if (min) {
      return `$${(min / 1000).toFixed(0)}k+ per year`;
    }
    return 'Not specified';
  };

  const getFreshnessLabel = (days) => {
    if (days === 0) return 'Posted today';
    if (days === 1) return 'Posted yesterday';
    if (days < 7) return `Posted ${days} days ago`;
    if (days < 30) return `Posted ${Math.floor(days / 7)} weeks ago`;
    return `Posted ${Math.floor(days / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job not found</h2>
          <Link href="/jobs" className="text-blue-600 hover:text-blue-700">
            ← Back to jobs
          </Link>
        </div>
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
              {user ? (
                <>
                  <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Login
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link 
          href="/jobs" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to all jobs
        </Link>
      </div>

      {/* Message */}
      {message.text && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className={`p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mt-0.5" />
            ) : (
              <X className="h-5 w-5 mt-0.5" />
            )}
            <p>{message.text}</p>
          </div>
        </div>
      )}

      {/* Job Details */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Job Header */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.job_title}</h1>
            
            <div className="flex items-center text-gray-600 mb-3">
              <Building2 className="h-5 w-5 mr-2" />
              <span className="text-lg font-medium">{job.company_name}</span>
            </div>

            <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
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
                  <span className="font-semibold">{formatSalary(job.min_salary, job.max_salary)}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{getFreshnessLabel(job.freshness_days)}</span>
              </div>
              {job.views_count > 0 && (
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>{job.views_count} views</span>
                </div>
              )}
              {job.applications_count > 0 && (
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{job.applications_count} applicants</span>
                </div>
              )}
            </div>
          </div>

          {/* Apply Button */}
          {user && user.role === 'jobseeker' && (
            <div className="mb-6">
              {hasApplied ? (
                <div className="flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-lg border border-green-200">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">You have already applied for this job</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Send className="h-5 w-5" />
                  Apply for this position
                </button>
              )}
            </div>
          )}

          {!user && (
            <div className="mb-6">
              <Link
                href={`/auth/login?redirect=/jobs/${jobId}`}
                className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center"
              >
                Login to Apply
              </Link>
            </div>
          )}

          {/* Job Description */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Job Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
          </div>

          {/* Experience Required */}
          {job.min_experience !== undefined && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Experience Required</h2>
              <p className="text-gray-700">
                {job.min_experience} - {job.max_experience || '+'} years
              </p>
            </div>
          )}

          {/* Number of Openings */}
          {job.number_of_openings > 1 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Number of Openings</h2>
              <p className="text-gray-700">{job.number_of_openings} positions</p>
            </div>
          )}

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Key Responsibilities</h2>
              <ul className="list-disc list-inside space-y-2">
                {job.responsibilities.map((responsibility, idx) => (
                  <li key={idx} className="text-gray-700">{responsibility}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Requirements</h2>
              <ul className="list-disc list-inside space-y-2">
                {job.requirements.map((requirement, idx) => (
                  <li key={idx} className="text-gray-700">{requirement}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Required Skills */}
          {job.required_skills && job.required_skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Preferred Skills */}
          {job.preferred_skills && job.preferred_skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Preferred Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.preferred_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Apply for {job.job_title}</h2>
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleApply}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter
                  </label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Tell the employer why you're a great fit for this position..."
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Optional: Explain your interest and qualifications for this role
                  </p>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applying}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {applying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit Application
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

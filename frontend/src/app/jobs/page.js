'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Clock, 
  DollarSign, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Building2,
  Calendar,
  Users,
  X
} from 'lucide-react';

export default function JobsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Search and filter states
  const [searchParams, setSearchParams] = useState({
    query: '',
    location: '',
    job_type: '',
    work_mode: '',
    min_experience: '',
    max_experience: '',
    min_salary: '',
    skills: '',
    freshness: '',
    sort_by: 'created_at',
    limit: 12
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (err) {
        console.log('User not logged in');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    searchJobs();
  }, [currentPage]);

  const searchJobs = async () => {
    setSearchLoading(true);
    try {
      const params = {
        ...searchParams,
        page: currentPage
      };
      
      // Remove empty params
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await api.get('/jobs/jobs', { params });
      setJobs(response.data.jobs || []);
      setTotalJobs(response.data.total || 0);
      setTotalPages(response.data.pages || 1);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setJobs([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    searchJobs();
  };

  const handleFilterChange = (key, value) => {
    setSearchParams({ ...searchParams, [key]: value });
  };

  const clearFilters = () => {
    setSearchParams({
      query: '',
      location: '',
      job_type: '',
      work_mode: '',
      min_experience: '',
      max_experience: '',
      min_salary: '',
      skills: '',
      freshness: '',
      sort_by: 'created_at',
      limit: 12
    });
    setCurrentPage(1);
    setTimeout(searchJobs, 100);
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
      <div className="bg-white border-b sticky top-0 z-10">
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
                  {user.role === 'employer' && (
                    <Link 
                      href="/post-job" 
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Post Job
                    </Link>
                  )}
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

      {/* Search Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-2">Find Your Dream Job</h1>
          <p className="text-blue-100 mb-6">Discover opportunities from top companies</p>
          
          <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  value={searchParams.query}
                  onChange={(e) => handleFilterChange('query', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="City, state, or country"
                  value={searchParams.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={searchLoading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Filter className="h-5 w-5" />
                Filters
              </button>
            </div>
          </form>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Clear All
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Job Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                  <select
                    value={searchParams.job_type}
                    onChange={(e) => handleFilterChange('job_type', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>

                {/* Work Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Work Mode</label>
                  <select
                    value={searchParams.work_mode}
                    onChange={(e) => handleFilterChange('work_mode', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Modes</option>
                    <option value="onsite">On-site</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Min Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Experience (years)</label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={searchParams.min_experience}
                    onChange={(e) => handleFilterChange('min_experience', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Max Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Experience (years)</label>
                  <input
                    type="number"
                    placeholder="Any"
                    min="0"
                    value={searchParams.max_experience}
                    onChange={(e) => handleFilterChange('max_experience', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Min Salary */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Salary ($)</label>
                  <input
                    type="number"
                    placeholder="Any"
                    min="0"
                    step="1000"
                    value={searchParams.min_salary}
                    onChange={(e) => handleFilterChange('min_salary', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Freshness */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Posted Within</label>
                  <select
                    value={searchParams.freshness}
                    onChange={(e) => handleFilterChange('freshness', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Any Time</option>
                    <option value="1">Last 24 hours</option>
                    <option value="7">Last 7 days</option>
                    <option value="14">Last 14 days</option>
                    <option value="30">Last 30 days</option>
                  </select>
                </div>

                {/* Skills */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skills (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g., React, Node.js, Python"
                    value={searchParams.skills}
                    onChange={(e) => handleFilterChange('skills', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={searchParams.sort_by}
                    onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="created_at">Most Recent</option>
                    <option value="min_salary">Highest Salary</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {searchLoading ? 'Searching...' : `${totalJobs} Jobs Found`}
            </h2>
            <p className="text-gray-600 mt-1">
              {currentPage > 1 && `Page ${currentPage} of ${totalPages}`}
            </p>
          </div>
        </div>

        {/* Job Cards */}
        {searchLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200 hover:border-blue-500"
                >
                  {/* Job Title */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                    {job.job_title}
                  </h3>

                  {/* Company */}
                  <div className="flex items-center text-gray-600 mb-3">
                    <Building2 className="h-4 w-4 mr-2" />
                    <span className="font-medium">{job.company_name}</span>
                  </div>

                  {/* Location & Work Mode */}
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{job.location}</span>
                    <span className="mx-2">•</span>
                    <span className="text-sm">{getWorkModeLabel(job.work_mode)}</span>
                  </div>

                  {/* Job Type & Experience */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {getJobTypeLabel(job.job_type)}
                    </span>
                    {job.min_experience !== undefined && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {job.min_experience}-{job.max_experience || '+'} years
                      </span>
                    )}
                  </div>

                  {/* Salary */}
                  {job.min_salary && (
                    <div className="flex items-center text-gray-700 mb-3">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span className="font-semibold">{formatSalary(job.min_salary, job.max_salary)}</span>
                    </div>
                  )}

                  {/* Skills */}
                  {job.required_skills && job.required_skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {job.required_skills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.required_skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs">
                            +{job.required_skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{getFreshnessLabel(job.freshness_days)}</span>
                    </div>
                    {job.applications_count > 0 && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{job.applications_count} applicants</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2 rounded-lg ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return <span key={pageNum}>...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

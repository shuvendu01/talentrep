'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Star,
  X,
  ChevronDown,
  ChevronUp,
  Building2,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  Filter
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
  const [expandedFilters, setExpandedFilters] = useState({
    location: true,
    experience: true,
    salary: true,
    jobType: true,
    workMode: true,
    skills: true
  });

  // Search and filter states
  const [searchParams, setSearchParams] = useState({
    query: '',
    location: '',
    job_type: '',
    work_mode: '',
    min_experience: '',
    max_experience: '',
    min_salary: '',
    max_salary: '',
    skills: [],
    verified_only: false,
    sort_by: 'created_at',
    limit: 12
  });

  const [skillInput, setSkillInput] = useState('');
  const [selectedLocations, setSelectedLocations] = useState([]);

  // Popular skills for quick selection
  const popularSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'Java', 'AWS',
    'Docker', 'SQL', 'MongoDB', 'TypeScript', 'Angular', 'Vue.js'
  ];

  // Popular locations
  const popularLocations = [
    'Bangalore', 'Mumbai', 'Delhi/NCR', 'Pune', 'Hyderabad', 'Chennai',
    'Kolkata', 'Ahmedabad', 'Remote'
  ];

  // Experience ranges
  const experienceRanges = [
    { label: '0-2 years (Fresher)', min: 0, max: 2 },
    { label: '2-5 years', min: 2, max: 5 },
    { label: '5-10 years', min: 5, max: 10 },
    { label: '10+ years', min: 10, max: 100 }
  ];

  // Salary ranges (in lakhs per annum)
  const salaryRanges = [
    { label: '0-3 LPA', min: 0, max: 300000 },
    { label: '3-6 LPA', min: 300000, max: 600000 },
    { label: '6-10 LPA', min: 600000, max: 1000000 },
    { label: '10-15 LPA', min: 1000000, max: 1500000 },
    { label: '15+ LPA', min: 1500000, max: 100000000 }
  ];

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
  }, [currentPage, searchParams.skills, searchParams.verified_only]);

  const searchJobs = async () => {
    setSearchLoading(true);
    try {
      const params = {
        ...searchParams,
        skills: searchParams.skills.join(','),
        page: currentPage
      };
      
      // Remove empty params
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined || params[key] === false) {
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

  const toggleFilter = (filterName) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const addSkill = (skill) => {
    if (!searchParams.skills.includes(skill)) {
      setSearchParams(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const removeSkill = (skill) => {
    setSearchParams(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSkillInputKeyDown = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      addSkill(skillInput.trim());
      setSkillInput('');
    }
  };

  const setLocationFilter = (location) => {
    setSearchParams(prev => ({
      ...prev,
      location: prev.location === location ? '' : location
    }));
  };

  const setExperienceFilter = (min, max) => {
    setSearchParams(prev => ({
      ...prev,
      min_experience: min,
      max_experience: max
    }));
  };

  const setSalaryFilter = (min, max) => {
    setSearchParams(prev => ({
      ...prev,
      min_salary: min,
      max_salary: max
    }));
  };

  const clearAllFilters = () => {
    setSearchParams({
      query: '',
      location: '',
      job_type: '',
      work_mode: '',
      min_experience: '',
      max_experience: '',
      min_salary: '',
      max_salary: '',
      skills: [],
      verified_only: false,
      sort_by: 'created_at',
      limit: 12
    });
    setCurrentPage(1);
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Not disclosed';
    const formatAmount = (amount) => {
      if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
      return `₹${(amount / 1000).toFixed(0)}K`;
    };
    if (min && max) return `${formatAmount(min)} - ${formatAmount(max)}`;
    if (min) return `${formatAmount(min)}+`;
    return `Up to ${formatAmount(max)}`;
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              TalentHub
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/applications" className="text-gray-600 hover:text-blue-600">My Applications</Link>
                  <Link href="/profile" className="text-gray-600 hover:text-blue-600">Profile</Link>
                  <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-gray-600 hover:text-blue-600">Login</Link>
                  <Link href="/auth/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs by title, company, or keywords..."
                value={searchParams.query}
                onChange={(e) => setSearchParams({...searchParams, query: e.target.value})}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </h2>
                {(searchParams.location || searchParams.skills.length > 0 || searchParams.min_experience || searchParams.verified_only) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Verified Jobs Only */}
                <div className="p-4 border-b border-gray-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={searchParams.verified_only}
                      onChange={(e) => setSearchParams({...searchParams, verified_only: e.target.checked})}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium text-gray-700">Verified jobs only</span>
                    </div>
                  </label>
                </div>

                {/* Location Filter */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleFilter('location')}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">Location</span>
                    </div>
                    {expandedFilters.location ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedFilters.location && (
                    <div className="px-4 pb-4 space-y-2">
                      {popularLocations.map((location) => (
                        <label key={location} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="location"
                            checked={searchParams.location === location}
                            onChange={() => setLocationFilter(location)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm text-gray-700">{location}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Experience Filter */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleFilter('experience')}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">Experience</span>
                    </div>
                    {expandedFilters.experience ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedFilters.experience && (
                    <div className="px-4 pb-4 space-y-2">
                      {experienceRanges.map((range) => (
                        <label key={range.label} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="experience"
                            checked={searchParams.min_experience == range.min && searchParams.max_experience == range.max}
                            onChange={() => setExperienceFilter(range.min, range.max)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm text-gray-700">{range.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Salary Filter */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleFilter('salary')}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">Salary Range</span>
                    </div>
                    {expandedFilters.salary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedFilters.salary && (
                    <div className="px-4 pb-4 space-y-2">
                      {salaryRanges.map((range) => (
                        <label key={range.label} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="salary"
                            checked={searchParams.min_salary == range.min && searchParams.max_salary == range.max}
                            onChange={() => setSalaryFilter(range.min, range.max)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm text-gray-700">{range.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Job Type Filter */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleFilter('jobType')}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">Job Type</span>
                    </div>
                    {expandedFilters.jobType ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedFilters.jobType && (
                    <div className="px-4 pb-4 space-y-2">
                      {['Full-time', 'Part-time', 'Contract', 'Internship'].map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="jobType"
                            checked={searchParams.job_type === type}
                            onChange={() => setSearchParams({...searchParams, job_type: searchParams.job_type === type ? '' : type})}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Work Mode Filter */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleFilter('workMode')}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">Work Mode</span>
                    </div>
                    {expandedFilters.workMode ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedFilters.workMode && (
                    <div className="px-4 pb-4 space-y-2">
                      {['Remote', 'Hybrid', 'On-site'].map((mode) => (
                        <label key={mode} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="workMode"
                            checked={searchParams.work_mode === mode}
                            onChange={() => setSearchParams({...searchParams, work_mode: searchParams.work_mode === mode ? '' : mode})}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm text-gray-700">{mode}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Skills Filter */}
                <div className="border-b border-gray-200">
                  <button
                    onClick={() => toggleFilter('skills')}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">Skills</span>
                    </div>
                    {expandedFilters.skills ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedFilters.skills && (
                    <div className="px-4 pb-4">
                      {/* Skill Input */}
                      <input
                        type="text"
                        placeholder="Type skill and press Enter"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleSkillInputKeyDown}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-3 focus:ring-2 focus:ring-blue-500"
                      />
                      
                      {/* Selected Skills */}
                      {searchParams.skills.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {searchParams.skills.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                            >
                              {skill}
                              <button
                                onClick={() => removeSkill(skill)}
                                className="hover:text-blue-900"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Popular Skills */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Popular Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {popularSkills.map((skill) => (
                            <button
                              key={skill}
                              onClick={() => addSkill(skill)}
                              disabled={searchParams.skills.includes(skill)}
                              className={`px-2 py-1 text-xs rounded border ${
                                searchParams.skills.includes(skill)
                                  ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:text-blue-600'
                              }`}
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Job Listings */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 font-medium">
                    {totalJobs} jobs found
                  </p>
                  {(searchParams.location || searchParams.skills.length > 0 || searchParams.verified_only) && (
                    <p className="text-sm text-gray-500 mt-1">Filters applied</p>
                  )}
                </div>
                <select
                  value={searchParams.sort_by}
                  onChange={(e) => setSearchParams({...searchParams, sort_by: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="created_at">Most Recent</option>
                  <option value="salary_max">Highest Salary</option>
                  <option value="applications_count">Most Applied</option>
                </select>
              </div>
            </div>

            {/* Job Cards */}
            {searchLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading jobs...</p>
                </div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search query</p>
                {(searchParams.location || searchParams.skills.length > 0 || searchParams.min_experience) && (
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => router.push(`/jobs/${job.id}`)}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              <span>{job.company_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-green-600">
                            {formatSalary(job.salary_min, job.salary_max)}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {getTimeAgo(job.created_at)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          <span>{job.experience_min}-{job.experience_max} years</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{job.job_type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          <span>{job.work_mode}</span>
                        </div>
                      </div>

                      {/* Skills */}
                      {job.required_skills && job.required_skills.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {job.required_skills.slice(0, 6).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                            {job.required_skills.length > 6 && (
                              <span className="px-2 py-1 text-gray-500 text-xs">
                                +{job.required_skills.length - 6} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Description Preview */}
                      {job.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {job.description.replace(/<[^>]*>/g, '').substring(0, 200)}...
                        </p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{job.applications_count || 0} applicants</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Posted {getTimeAgo(job.created_at)}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/jobs/${job.id}`);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
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
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

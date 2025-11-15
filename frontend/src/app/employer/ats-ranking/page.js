'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Award, ArrowLeft, Users, TrendingUp, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import ATSRankingCard from '@/components/ATSRankingCard';

export default function ATSRankingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('job_id');
  
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (jobId) {
      fetchRankings();
    }
  }, [jobId]);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      const response = await api.post('/profiles/ats/rank-multiple', {
        job_id: jobId
      });
      setRanking(response.data);
    } catch (err) {
      console.error('Failed to fetch rankings:', err);
      setError(err.response?.data?.detail || 'Failed to load ATS rankings');
    } finally {
      setLoading(false);
    }
  };

  if (!jobId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p>No job selected. Please select a job to view ATS rankings.</p>
          <Link href="/employer/jobs" className="mt-4 inline-block text-green-400 hover:text-green-300">
            Go to My Jobs
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-green-400 animate-spin mx-auto mb-4" />
          <p className="text-white">Analyzing candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/employer/jobs"
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <ArrowLeft className="h-5 w-5 text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">ATS Candidate Ranking</h1>
                {ranking && (
                  <p className="text-gray-400 text-sm mt-1">{ranking.job_title}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {ranking && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-6 w-6 text-green-400" />
                  <span className="text-gray-400">Total Candidates</span>
                </div>
                <p className="text-3xl font-bold text-white">{ranking.total_candidates}</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="h-6 w-6 text-blue-400" />
                  <span className="text-gray-400">Highly Recommended</span>
                </div>
                <p className="text-3xl font-bold text-white">
                  {ranking.candidates?.filter(c => c.category === 'highly_recommended').length || 0}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-6 w-6 text-purple-400" />
                  <span className="text-gray-400">Avg Match Score</span>
                </div>
                <p className="text-3xl font-bold text-white">
                  {ranking.candidates?.length > 0
                    ? Math.round(
                        ranking.candidates.reduce((sum, c) => sum + c.overall_score, 0) /
                        ranking.candidates.length
                      )
                    : 0}%
                </p>
              </div>
            </div>

            {/* Ranked Candidates */}
            {ranking.candidates && ranking.candidates.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Ranked Candidates (Top to Bottom)
                </h2>
                {ranking.candidates.map((candidate, index) => (
                  <div key={candidate.candidate_id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="flex items-start gap-6">
                      {/* Rank Badge */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                          <span className="text-xl font-bold text-white">#{index + 1}</span>
                        </div>
                      </div>

                      {/* Candidate Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">
                              {candidate.candidate_name || 'Anonymous Candidate'}
                            </h3>
                            <p className="text-gray-400">{candidate.current_position || 'Professional'}</p>
                            {candidate.experience_years && (
                              <p className="text-sm text-gray-500 mt-1">
                                {candidate.experience_years} years of experience
                              </p>
                            )}
                          </div>
                        </div>

                        {/* ATS Ranking */}
                        <ATSRankingCard ranking={candidate} compact={false} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Candidates to Rank</h3>
                <p className="text-gray-400">
                  There are no applications for this job yet.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

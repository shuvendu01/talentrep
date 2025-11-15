'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import JobSeekerLayout from '@/components/JobSeekerLayout';
import Link from 'next/link';
import { Award, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function VerificationPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get('/auth/me');
        if (userRes.data.role !== 'jobseeker') {
          router.push('/dashboard');
          return;
        }
        setUser(userRes.data);
        
        const verifyRes = await api.get(`/interviews/ratings/jobseeker/${userRes.data.id}`);
        setVerification(verifyRes.data);
      } catch (err) {
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <JobSeekerLayout>
      <div className="p-8">
        <h1 className="text-4xl font-bold text-white mb-8">Skill Verification</h1>

        {!verification?.has_verification ? (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
            <AlertCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">No Verification Yet</h2>
            <p className="text-gray-300 mb-6">Request an interview to get your skills verified by industry experts.</p>
            <Link href="/interview-requests" className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold">Request Interview</Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Verified Professional</h2>
                  <p className="text-gray-300">Verified on {new Date(verification.latest_rating.verification_date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Overall Rating</span>
                  <span className="text-3xl font-bold text-white">{verification.latest_rating.overall_rating.toFixed(1)}/5.0</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{width: `${(verification.latest_rating.overall_rating / 5) * 100}%`}} />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-4">Skill Ratings</h3>
                <div className="space-y-3">
                  {verification.latest_rating.skill_ratings.map((skill, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">{skill.skill_name}</span>
                        <span className="text-white font-semibold">{skill.rating.toFixed(1)}/5.0</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{width: `${(skill.rating / 5) * 100}%`}} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

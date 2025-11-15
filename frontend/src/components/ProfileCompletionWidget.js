'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function ProfileCompletionWidget({ className = '' }) {
  const [completion, setCompletion] = useState(0);
  const [missingFields, setMissingFields] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileCompletion();
  }, []);

  const fetchProfileCompletion = async () => {
    try {
      const response = await api.get('/profiles/jobseeker/profile');
      const profile = response.data;
      
      // Calculate completion based on important fields
      const fields = [
        { key: 'first_name', label: 'First Name', link: '/profile' },
        { key: 'last_name', label: 'Last Name', link: '/profile' },
        { key: 'phone', label: 'Phone Number', link: '/profile' },
        { key: 'location', label: 'Location', link: '/profile' },
        { key: 'current_position', label: 'Current Position', link: '/profile' },
        { key: 'experience_years', label: 'Years of Experience', link: '/profile' },
        { key: 'primary_skills', label: 'Skills', link: '/profile', check: (val) => val && val.length > 0 },
        { key: 'resume_url', label: 'Resume', link: '/profile' },
        { key: 'bio', label: 'Bio/Summary', link: '/profile' },
        { key: 'expected_salary', label: 'Expected Salary', link: '/settings' },
      ];

      const missing = [];
      let completed = 0;

      fields.forEach(field => {
        const value = profile[field.key];
        const isComplete = field.check ? field.check(value) : value != null && value !== '';
        
        if (isComplete) {
          completed++;
        } else {
          missing.push(field);
        }
      });

      const percentage = Math.round((completed / fields.length) * 100);
      setCompletion(percentage);
      setMissingFields(missing);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch profile completion:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (completion === 100) {
    return (
      <div className={`bg-green-500/10 border border-green-500/30 rounded-2xl p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
          <div>
            <p className="text-green-400 font-semibold">Profile Complete!</p>
            <p className="text-green-300 text-sm">Your profile is fully optimized</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Complete Your Profile</h3>
          <p className="text-gray-400 text-sm">Stand out to employers</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-white">{completion}%</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      {/* Missing Fields */}
      {missingFields.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-400 mb-3">Complete these sections:</p>
          {missingFields.slice(0, 3).map((field, idx) => (
            <Link
              key={idx}
              href={field.link}
              className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-gray-300">{field.label}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
            </Link>
          ))}
          {missingFields.length > 3 && (
            <p className="text-xs text-gray-500 text-center mt-2">
              +{missingFields.length - 3} more fields
            </p>
          )}
        </div>
      )}
    </div>
  );
}

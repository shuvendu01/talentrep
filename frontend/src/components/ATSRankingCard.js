'use client';

import { CheckCircle, AlertCircle, TrendingUp, Award } from 'lucide-react';

const getCategoryColor = (category) => {
  const colors = {
    highly_recommended: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400',
      icon: 'text-green-400'
    },
    recommended: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      icon: 'text-blue-400'
    },
    consider: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      icon: 'text-yellow-400'
    },
    not_recommended: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      icon: 'text-red-400'
    }
  };
  return colors[category] || colors.consider;
};

const ScoreBar = ({ label, score, color = 'blue' }) => (
  <div className="mb-3">
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-300">{label}</span>
      <span className="text-white font-semibold">{score}%</span>
    </div>
    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-400 transition-all duration-500`}
        style={{ width: `${score}%` }}
      />
    </div>
  </div>
);

export default function ATSRankingCard({ ranking, compact = false }) {
  if (!ranking) return null;

  const colors = getCategoryColor(ranking.category);
  const Icon = ranking.category === 'highly_recommended' ? Award : 
               ranking.category === 'recommended' ? CheckCircle :
               ranking.category === 'consider' ? TrendingUp : AlertCircle;

  if (compact) {
    return (
      <div className={`${colors.bg} border ${colors.border} rounded-xl p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className={`h-5 w-5 ${colors.icon}`} />
            <div>
              <p className={`font-semibold ${colors.text}`}>{ranking.ranking}</p>
              <p className="text-xs text-gray-400">ATS Match Score</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{ranking.overall_score}%</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 ${colors.bg} rounded-xl`}>
            <Icon className={`h-6 w-6 ${colors.icon}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">ATS Ranking</h3>
            <p className={`font-semibold ${colors.text}`}>{ranking.ranking}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400 mb-1">Overall Score</p>
          <p className="text-4xl font-bold text-white">{ranking.overall_score}%</p>
        </div>
      </div>

      {/* Breakdown */}
      {ranking.breakdown && (
        <div className="space-y-1">
          <p className="text-sm text-gray-400 mb-3 font-medium">Score Breakdown</p>
          
          <ScoreBar
            label="Skills Match"
            score={ranking.breakdown.skills?.score || 0}
            color="purple"
          />
          
          <ScoreBar
            label="Experience Match"
            score={ranking.breakdown.experience?.score || 0}
            color="blue"
          />
          
          <ScoreBar
            label="Location Match"
            score={ranking.breakdown.location?.score || 0}
            color="green"
          />
          
          <ScoreBar
            label="Education Match"
            score={ranking.breakdown.education?.score || 0}
            color="orange"
          />
        </div>
      )}

      {/* Recommendation */}
      <div className={`mt-6 p-4 ${colors.bg} border ${colors.border} rounded-xl`}>
        <p className="text-sm text-gray-300">
          {ranking.category === 'highly_recommended' && '⭐ This candidate is an excellent match for the position. Highly recommended for interview.'}
          {ranking.category === 'recommended' && '✓ This candidate is a good match for the position. Recommended for consideration.'}
          {ranking.category === 'consider' && '⚠ This candidate partially matches the requirements. Consider for interview with reservations.'}
          {ranking.category === 'not_recommended' && '✗ This candidate has a low match score. Not recommended for this position.'}
        </p>
      </div>
    </div>
  );
}

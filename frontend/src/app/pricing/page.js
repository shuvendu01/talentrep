'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Briefcase, Check, Award, Building, Users, ArrowRight, Star } from 'lucide-react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = {
    jobseeker: {
      name: 'Job Seeker',
      icon: Briefcase,
      color: 'blue',
      gradient: 'from-blue-600 to-cyan-600',
      description: 'Find your dream job with verified skills',
      signupBonus: '200 Free Credits',
      features: [
        'Create professional profile',
        'Apply to unlimited jobs',
        'Resume upload & parsing',
        'Skill verification interviews',
        'Profile completion tracking',
        'Job search with filters',
        'Application tracking'
      ],
      credits: [
        { amount: 10000, price: 49, popular: false },
        { amount: 25000, price: 99, popular: true, savings: '20%' },
        { amount: 50000, price: 179, popular: false, savings: '28%' }
      ],
      usageNote: 'Interview Request: 6,000 credits'
    },
    employer: {
      name: 'Employer',
      icon: Building,
      color: 'green',
      gradient: 'from-green-600 to-emerald-600',
      description: 'Find top talent for your team',
      signupBonus: '10,000 Free Credits',
      features: [
        'Post unlimited jobs',
        'Advanced talent search',
        'ATS candidate ranking',
        'Contact reveal system',
        'Application management',
        'Company profile page',
        'Priority support'
      ],
      credits: [
        { amount: 50000, price: 199, popular: false },
        { amount: 150000, price: 499, popular: true, savings: '17%' },
        { amount: 300000, price: 899, popular: false, savings: '25%' }
      ],
      usageNote: 'Contact Reveal: 12,000 credits'
    },
    interviewer: {
      name: 'Interviewer',
      icon: Award,
      color: 'purple',
      gradient: 'from-purple-600 to-pink-600',
      description: 'Earn by verifying skills',
      signupBonus: '500 Free Credits',
      features: [
        'Flexible schedule',
        'Choose your expertise',
        'Earn per interview',
        'Rating system',
        'Professional profile',
        'Interview dashboard',
        'Instant payouts'
      ],
      earnings: [
        { type: 'Interview Completion', amount: 600, note: 'per interview' },
        { type: 'High Rating Bonus', amount: 100, note: 'for 5★ ratings' },
        { type: 'Milestone Rewards', amount: 1000, note: 'at 10, 50, 100 interviews' }
      ],
      usageNote: 'Earn 600 credits per completed interview'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl fixed w-full top-0 z-50">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Briefcase className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">TalentHub</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/auth/login"
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2.5 rounded-lg hover:opacity-90 transition-all font-medium shadow-lg"
            >
              Sign Up Free
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Choose your role and get started with free credits. Pay only for what you need.
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-full">
            <Star className="h-5 w-5 text-green-400 fill-current" />
            <span className="text-green-400 font-semibold">All plans include free signup credits!</span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Seeker Plan */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-blue-500/50 transition-all">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plans.jobseeker.gradient} flex items-center justify-center mb-6`}>
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{plans.jobseeker.name}</h3>
            <p className="text-gray-400 mb-6">{plans.jobseeker.description}</p>
            
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-blue-400 font-semibold">{plans.jobseeker.signupBonus}</p>
              <p className="text-xs text-gray-400 mt-1">On registration</p>
            </div>

            <div className="space-y-3 mb-8">
              {plans.jobseeker.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-6 mb-6">
              <p className="text-sm font-semibold text-white mb-4">Credit Packages</p>
              {plans.jobseeker.credits.map((pkg, idx) => (
                <div key={idx} className={`p-4 rounded-xl mb-3 ${pkg.popular ? 'bg-blue-500/20 border-2 border-blue-500' : 'bg-white/5 border border-white/10'}`}>
                  {pkg.popular && (
                    <span className="text-xs font-semibold text-blue-400 mb-2 block">MOST POPULAR</span>
                  )}
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-bold text-white">${pkg.price}</span>
                      <span className="text-gray-400 text-sm ml-2">{pkg.amount.toLocaleString()} credits</span>
                    </div>
                    {pkg.savings && (
                      <span className="text-xs font-semibold text-green-400">Save {pkg.savings}</span>
                    )}
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-400 mt-4">{plans.jobseeker.usageNote}</p>
            </div>

            <Link
              href="/auth/register"
              className="block w-full text-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all"
            >
              Get Started Free
            </Link>
          </div>

          {/* Employer Plan */}
          <div className="bg-white/5 backdrop-blur-xl border-2 border-green-500 rounded-3xl p-8 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full">
              <span className="text-white text-sm font-bold">RECOMMENDED</span>
            </div>
            
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plans.employer.gradient} flex items-center justify-center mb-6 mt-2`}>
              <Building className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{plans.employer.name}</h3>
            <p className="text-gray-400 mb-6">{plans.employer.description}</p>
            
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <p className="text-green-400 font-semibold">{plans.employer.signupBonus}</p>
              <p className="text-xs text-gray-400 mt-1">On registration</p>
            </div>

            <div className="space-y-3 mb-8">
              {plans.employer.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-6 mb-6">
              <p className="text-sm font-semibold text-white mb-4">Credit Packages</p>
              {plans.employer.credits.map((pkg, idx) => (
                <div key={idx} className={`p-4 rounded-xl mb-3 ${pkg.popular ? 'bg-green-500/20 border-2 border-green-500' : 'bg-white/5 border border-white/10'}`}>
                  {pkg.popular && (
                    <span className="text-xs font-semibold text-green-400 mb-2 block">MOST POPULAR</span>
                  )}
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-bold text-white">${pkg.price}</span>
                      <span className="text-gray-400 text-sm ml-2">{pkg.amount.toLocaleString()} credits</span>
                    </div>
                    {pkg.savings && (
                      <span className="text-xs font-semibold text-green-400">Save {pkg.savings}</span>
                    )}
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-400 mt-4">{plans.employer.usageNote}</p>
            </div>

            <Link
              href="/companies/register"
              className="block w-full text-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all"
            >
              Get Started Free
            </Link>
          </div>

          {/* Interviewer Plan */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-purple-500/50 transition-all">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plans.interviewer.gradient} flex items-center justify-center mb-6`}>
              <Award className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{plans.interviewer.name}</h3>
            <p className="text-gray-400 mb-6">{plans.interviewer.description}</p>
            
            <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <p className="text-purple-400 font-semibold">{plans.interviewer.signupBonus}</p>
              <p className="text-xs text-gray-400 mt-1">On registration</p>
            </div>

            <div className="space-y-3 mb-8">
              {plans.interviewer.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-6 mb-6">
              <p className="text-sm font-semibold text-white mb-4">Earnings Structure</p>
              {plans.interviewer.earnings.map((earning, idx) => (
                <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-xl mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">{earning.type}</span>
                    <span className="text-lg font-bold text-white">+{earning.amount}</span>
                  </div>
                  <p className="text-xs text-gray-400">{earning.note}</p>
                </div>
              ))}
              <p className="text-xs text-gray-400 mt-4">{plans.interviewer.usageNote}</p>
            </div>

            <Link
              href="/interviewers/register"
              className="block w-full text-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all"
            >
              Start Earning
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">How do credits work?</h3>
            <p className="text-gray-400">Credits are the currency used on TalentHub. Job seekers use credits to request skill verification interviews. Employers use credits to reveal candidate contact information. Interviewers earn credits by completing interviews.</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Can I get a refund on unused credits?</h3>
            <p className="text-gray-400">Yes! We offer full refunds on unused purchased credits within 30 days of purchase. Free signup credits are non-refundable.</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Do credits expire?</h3>
            <p className="text-gray-400">No, your credits never expire. Use them at your own pace.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

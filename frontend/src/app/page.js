'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Search, UserCheck, Award, ChevronRight, TrendingUp, Shield, Zap } from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm fixed w-full top-0 z-50">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Briefcase className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">TalentHub</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/jobs" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Find Jobs
            </Link>
            <Link href="/companies" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Companies
            </Link>
            <Link href="/interviewers" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Become Interviewer
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/auth/login"
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
            >
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Connect Talent with
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"> Verified </span>
              Opportunity
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Professional job portal with interviewer-verified profiles, skill ratings, and credit-based
              contact access. Build trust in every connection.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/auth/register?role=jobseeker"
                className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all font-medium text-lg shadow-lg hover:shadow-xl hover:scale-105"
              >
                Find Your Next Role
                <ChevronRight className="inline-block ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/auth/register?role=employer"
                className="w-full sm:w-auto border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-all font-medium text-lg"
              >
                Hire Top Talent
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose TalentHub?</h2>
            <p className="text-lg text-gray-600">The most trusted platform for verified talent connections</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                <UserCheck className="h-7 w-7 text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Interviewer Verification</h3>
              <p className="text-gray-600 leading-relaxed">
                Profiles verified by certified interviewers based on skills and experience, ensuring quality and trust.
              </p>
            </div>
            <div className="p-8 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                <Award className="h-7 w-7 text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Skill-Based Ratings</h3>
              <p className="text-gray-600 leading-relaxed">
                Get detailed ratings on primary and secondary skills with customizable weightage and verification badges.
              </p>
            </div>
            <div className="p-8 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                <Shield className="h-7 w-7 text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Protected Contact Access</h3>
              <p className="text-gray-600 leading-relaxed">
                Credit-based system protects candidate privacy while enabling meaningful connections with employers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Simple steps to verified success</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Sign Up', desc: 'Create your profile and choose your role' },
              { step: '02', title: 'Get Verified', desc: 'Book interview with certified interviewers' },
              { step: '03', title: 'Earn Ratings', desc: 'Receive skill-based ratings and badges' },
              { step: '04', title: 'Get Hired', desc: 'Connect with top employers' },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-blue-600 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: '10,000+', label: 'Verified Profiles' },
              { number: '5,000+', label: 'Active Jobs' },
              { number: '2,000+', label: 'Companies' },
              { number: '500+', label: 'Certified Interviewers' },
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of verified professionals and top companies today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register?role=jobseeker"
              className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all font-medium text-lg shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors font-medium text-lg"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Briefcase className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">TalentHub</span>
              </div>
              <p className="text-gray-600 text-sm">
                Connecting verified talent with opportunity through trust and transparency.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">For Job Seekers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/jobs" className="text-gray-600 hover:text-blue-600">Find Jobs</Link></li>
                <li><Link href="/verification" className="text-gray-600 hover:text-blue-600">Get Verified</Link></li>
                <li><Link href="/profile" className="text-gray-600 hover:text-blue-600">Build Profile</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">For Employers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/post-job" className="text-gray-600 hover:text-blue-600">Post Jobs</Link></li>
                <li><Link href="/search-talent" className="text-gray-600 hover:text-blue-600">Search Talent</Link></li>
                <li><Link href="/pricing" className="text-gray-600 hover:text-blue-600">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-gray-600 hover:text-blue-600">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-blue-600">Contact</Link></li>
                <li><Link href="/terms" className="text-gray-600 hover:text-blue-600">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-gray-600 text-sm">
            <p>&copy; 2025 TalentHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Briefcase, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await api.get(`/auth/verify?token=${token}`);
        
        // Store auth token
        localStorage.setItem('authToken', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        setStatus('success');
        setMessage('Successfully authenticated!');
        
        // Redirect based on user role
        setTimeout(() => {
          const role = response.data.user.role;
          if (role === 'admin') {
            router.push('/admin/dashboard');
          } else if (role === 'employer') {
            router.push('/employer/dashboard');
          } else if (role === 'interviewer') {
            router.push('/interviewer/dashboard');
          } else {
            router.push('/dashboard');
          }
        }, 1500);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.detail || 'Failed to verify magic link');
      }
    };

    verifyToken();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-blue-600">
            <Briefcase className="h-10 w-10" />
            <span className="text-3xl font-bold">TalentHub</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center py-8">
            {status === 'verifying' && (
              <>
                <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying...</h2>
                <p className="text-gray-600">Please wait while we verify your magic link</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
                <p className="text-gray-600">{message}</p>
                <p className="text-sm text-gray-500 mt-4">Redirecting to your dashboard...</p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <Link
                  href="/auth/login"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Request New Link
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 text-blue-600">
              <Briefcase className="h-10 w-10" />
              <span className="text-3xl font-bold">TalentHub</span>
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center py-8">
              <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
            </div>
          </div>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}

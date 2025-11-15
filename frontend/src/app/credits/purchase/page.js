'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import JobSeekerLayout from '@/components/JobSeekerLayout';
import { Coins, Check, Zap, Award, CreditCard } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function PurchaseCreditsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentCredits, setCurrentCredits] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const packages = [
    {
      id: 'starter',
      name: 'Starter Pack',
      credits: 10000,
      price: 49,
      popular: false,
      interviews: '~1-2 interviews',
      perCredit: 0.0049,
      features: ['Instant credit delivery', '30-day money-back', 'Email support']
    },
    {
      id: 'popular',
      name: 'Popular Pack',
      credits: 25000,
      price: 99,
      popular: true,
      interviews: '~4 interviews',
      perCredit: 0.00396,
      savings: 20,
      features: ['Instant credit delivery', '30-day money-back', 'Priority support', '20% savings']
    },
    {
      id: 'premium',
      name: 'Premium Pack',
      credits: 50000,
      price: 179,
      popular: false,
      interviews: '~8 interviews',
      perCredit: 0.00358,
      savings: 28,
      features: ['Instant credit delivery', '30-day money-back', 'Priority support', '28% savings', 'Bonus credits']
    }
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userRes = await api.get('/auth/me');
      if (userRes.data.role !== 'jobseeker') {
        toast.error('Only job seekers can purchase credits');
        router.push('/dashboard');
        return;
      }
      setUser(userRes.data);

      const creditsRes = await api.get('/credits/balance');
      setCurrentCredits(creditsRes.data.total_credits);
    } catch (err) {
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (pkg) => {
    setSelectedPackage(pkg);
    // TODO: Integrate with payment gateway (Stripe/PayPal)
    toast('Payment integration coming soon! This will connect to Stripe.', { icon: '💳' });
  };

  if (loading) {
    return (
      <JobSeekerLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </JobSeekerLayout>
    );
  }

  return (
    <JobSeekerLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Purchase Credits</h1>
          <p className="text-gray-400">Invest in your career growth with skill verification interviews</p>
        </div>

        {/* Current Balance */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Current Balance</p>
              <p className="text-4xl font-bold text-white">{currentCredits.toLocaleString()}</p>
              <p className="text-blue-100 text-sm mt-1">credits available</p>
            </div>
            <Coins className="h-16 w-16 text-white opacity-20" />
          </div>
        </div>

        {/* Usage Info */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">How Credits Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Award className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium mb-1">Interview Request</p>
                <p className="text-sm text-gray-400">6,000 credits per interview verification</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Zap className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium mb-1">Instant Delivery</p>
                <p className="text-sm text-gray-400">Credits added to your account immediately</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Check className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium mb-1">Never Expire</p>
                <p className="text-sm text-gray-400">Use your credits whenever you need</p>
              </div>
            </div>
          </div>
        </div>

        {/* Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white/5 backdrop-blur-xl border rounded-2xl p-6 hover:scale-105 transition-all ${
                pkg.popular ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-white/10'
              } relative`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full">
                  <span className="text-white text-xs font-bold">MOST POPULAR</span>
                </div>
              )}

              <div className="mb-6 mt-2">
                <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-bold text-white">${pkg.price}</span>
                  <span className="text-gray-400">USD</span>
                </div>
                <p className="text-gray-400 text-sm">{pkg.credits.toLocaleString()} credits</p>
                {pkg.savings && (
                  <div className="inline-block mt-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                    <span className="text-green-400 text-xs font-semibold">Save {pkg.savings}%</span>
                  </div>
                )}
              </div>

              <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <p className="text-blue-400 font-medium text-sm">{pkg.interviews}</p>
                <p className="text-xs text-gray-400 mt-1">${pkg.perCredit.toFixed(5)} per credit</p>
              </div>

              <div className="space-y-3 mb-6">
                {pkg.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handlePurchase(pkg)}
                className={`w-full px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  pkg.popular
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90'
                    : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                }`}
              >
                <CreditCard className="h-5 w-5" />
                Purchase Now
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <p className="text-white font-medium mb-1">How do I use my credits?</p>
              <p className="text-sm text-gray-400">Credits are automatically deducted when you request a skill verification interview. Each interview costs 6,000 credits.</p>
            </div>
            <div>
              <p className="text-white font-medium mb-1">Can I get a refund?</p>
              <p className="text-sm text-gray-400">Yes! Unused purchased credits can be refunded within 30 days of purchase. Contact support for assistance.</p>
            </div>
            <div>
              <p className="text-white font-medium mb-1">What payment methods do you accept?</p>
              <p className="text-sm text-gray-400">We accept all major credit cards, debit cards, and PayPal through our secure payment processor.</p>
            </div>
          </div>
        </div>
      </div>
    </JobSeekerLayout>
  );
}

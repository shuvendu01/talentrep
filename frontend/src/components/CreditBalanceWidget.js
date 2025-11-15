'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

export default function CreditBalanceWidget() {
  const [credits, setCredits] = useState({ free: 0, paid: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await api.get('/credits/balance');
        setCredits({
          free: response.data.credits_free,
          paid: response.data.credits_paid,
          total: response.data.total_credits
        });
      } catch (err) {
        console.error('Failed to fetch credits:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();
    
    // Refresh credits every 30 seconds
    const interval = setInterval(fetchCredits, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return null;
  }

  return (
    <Link href="/credits/transactions">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        className="relative group cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity" />
        <div className="relative bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg">
          <Coins className="h-5 w-5 text-white" />
          <div className="text-white">
            <div className="text-xs font-medium opacity-90">Credits</div>
            <div className="text-lg font-bold leading-none">{credits.total.toLocaleString()}</div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

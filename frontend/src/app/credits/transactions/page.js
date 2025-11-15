'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import JobSeekerLayout from '@/components/JobSeekerLayout';
import Link from 'next/link';
import { Coins, ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState({ free: 0, paid: 0, total: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const balanceRes = await api.get('/credits/balance');
        setBalance({ free: balanceRes.data.credits_free, paid: balanceRes.data.credits_paid, total: balanceRes.data.total_credits });
        const transRes = await api.get('/credits/transactions', { params: { page, limit: 20 } });
        setTransactions(transRes.data.transactions || []);
        setTotalPages(transRes.data.pages || 1);
      } catch (err) {
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router, page]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <JobSeekerLayout>
      <div className="p-8">
        <h1 className="text-4xl font-bold text-white mb-8">Credit Transactions</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <div className="flex justify-between mb-2"><span className="text-sm text-gray-300">Total</span><Coins className="h-5 w-5 text-yellow-400" /></div>
            <p className="text-3xl font-bold text-white">{balance.total.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <div className="flex justify-between mb-2"><span className="text-sm text-gray-300">Free</span><TrendingUp className="h-5 w-5 text-green-400" /></div>
            <p className="text-3xl font-bold text-green-400">{balance.free.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <div className="flex justify-between mb-2"><span className="text-sm text-gray-300">Paid</span><TrendingDown className="h-5 w-5 text-blue-400" /></div>
            <p className="text-3xl font-bold text-blue-400">{balance.paid.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
          {transactions.length === 0 ? (
            <div className="text-center py-12"><Coins className="h-16 w-16 text-gray-500 mx-auto mb-4" /><h3 className="text-xl text-white">No transactions</h3></div>
          ) : (
            <div className="divide-y divide-white/10">
              {transactions.map(t => (
                <div key={t.id} className="p-6 hover:bg-white/5 flex justify-between">
                  <div className="flex gap-4">
                    <div className="mt-1">{t.transaction_type === 'earn' || t.transaction_type === 'bonus' ? <ArrowUpCircle className="h-5 w-5 text-green-400" /> : <ArrowDownCircle className="h-5 w-5 text-red-400" />}</div>
                    <div><h4 className="font-semibold text-white">{t.description}</h4><p className="text-sm text-gray-400">{t.category}</p><p className="text-xs text-gray-500 mt-1">{new Date(t.created_at).toLocaleString()}</p></div>
                  </div>
                  <div className="text-right"><p className={cn('text-2xl font-bold', t.amount > 0 ? 'text-green-400' : 'text-red-400')}>{t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()}</p><p className="text-sm text-gray-400">Bal: {(t.balance_free + t.balance_paid).toLocaleString()}</p></div>
                </div>
              ))}
              {totalPages > 1 && (
                <div className="bg-white/5 px-6 py-3 flex justify-between"><button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-white/5 rounded-lg text-white disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button><span className="text-gray-400">Page {page}/{totalPages}</span><button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 bg-white/5 rounded-lg text-white disabled:opacity-50"><ChevronRight className="h-4 w-4" /></button></div>
              )}
            </div>
          )}
        </div>
      </div>
    </JobSeekerLayout>
  );
}
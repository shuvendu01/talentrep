'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import Link from 'next/link';
import { Coins, Download, Filter, Calendar, ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/exportUtils';

export default function TransactionsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState({ free: 0, paid: 0, total: 0 });
  const [filters, setFilters] = useState({
    transaction_type: '',
    category: '',
    start_date: '',
    end_date: '',
    page: 1,
    limit: 20
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await api.get('/auth/me');
        setUser(userResponse.data);

        const balanceResponse = await api.get('/credits/balance');
        setBalance({
          free: balanceResponse.data.credits_free,
          paid: balanceResponse.data.credits_paid,
          total: balanceResponse.data.total_credits
        });

        await fetchTransactions();
      } catch (err) {
        console.error('Failed to fetch data:', err);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  useEffect(() => {
    if (user) fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      const params = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) params[key] = filters[key];
      });

      const response = await api.get('/credits/transactions', { params });
      setTransactions(response.data.transactions || []);
      setTotalPages(response.data.pages || 1);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
  };

  const handleExport = async (format) => {
    try {
      if (format === 'csv') {
        const response = await api.get('/credits/transactions/export', {
          params: {
            transaction_type: filters.transaction_type,
            category: filters.category,
            start_date: filters.start_date,
            end_date: filters.end_date
          },
          responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const exportData = transactions.map(t => ({
          Date: new Date(t.created_at).toLocaleString(),
          Type: t.transaction_type,
          Category: t.category,
          Amount: t.amount,
          Description: t.description,
          Balance: t.balance_free + t.balance_paid
        }));

        if (format === 'excel') {
          exportToExcel(exportData, `transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
        } else if (format === 'pdf') {
          const columns = [
            { key: 'Date', label: 'Date' },
            { key: 'Type', label: 'Type' },
            { key: 'Amount', label: 'Amount' },
            { key: 'Balance', label: 'Balance' }
          ];
          exportToPDF(exportData, columns, `transactions_${new Date().toISOString().split('T')[0]}.pdf`, 'Transaction History');
        }
      }
    } catch (err) {
      console.error('Failed to export:', err);
    }
  };

  const getTransactionIcon = (type) => {
    return type === 'earn' || type === 'bonus' || type === 'admin_add' 
      ? <ArrowUpCircle className="h-5 w-5 text-green-400" />
      : <ArrowDownCircle className="h-5 w-5 text-red-400" />;
  };

  const getTransactionColor = (type) => {
    return type === 'earn' || type === 'bonus' || type === 'admin_add'
      ? 'text-green-400'
      : 'text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              TalentHub
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Credit Transactions
          </h1>
          <p className="text-gray-400">View your complete transaction history</p>
        </motion.div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Total Credits</span>
              <Coins className="h-5 w-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">{balance.total.toLocaleString()}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Free Credits</span>
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-400">{balance.free.toLocaleString()}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Paid Credits</span>
              <TrendingDown className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-blue-400">{balance.paid.toLocaleString()}</p>
          </motion.div>
        </div>

        {/* Filters & Export */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <select value={filters.transaction_type}
              onChange={(e) => setFilters({ ...filters, transaction_type: e.target.value, page: 1 })}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Types</option>
              <option value="earn">Earn</option>
              <option value="spend">Spend</option>
              <option value="bonus">Bonus</option>
              <option value="admin_add">Admin Add</option>
            </select>

            <select value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Categories</option>
              <option value="signup_bonus">Signup Bonus</option>
              <option value="interview_completion">Interview</option>
              <option value="contact_reveal">Contact Reveal</option>
              <option value="interview_request">Interview Request</option>
            </select>

            <input type="date" value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value, page: 1 })}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />

            <input type="date" value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value, page: 1 })}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />

            <div className="relative group">
              <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button onClick={() => handleExport('csv')} className="w-full px-4 py-2 text-left text-white hover:bg-white/10 rounded-t-lg">CSV</button>
                <button onClick={() => handleExport('excel')} className="w-full px-4 py-2 text-left text-white hover:bg-white/10">Excel</button>
                <button onClick={() => handleExport('pdf')} className="w-full px-4 py-2 text-left text-white hover:bg-white/10 rounded-b-lg">PDF</button>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <Coins className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No transactions found</h3>
              <p className="text-gray-400">Your transaction history will appear here</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-white/10">
                {transactions.map((transaction, index) => (
                  <motion.div key={transaction.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-white/5 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          {getTransactionIcon(transaction.transaction_type)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white mb-1">{transaction.description}</h4>
                          <p className="text-sm text-gray-400">{transaction.category.replace('_', ' ')}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(transaction.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn('text-2xl font-bold', getTransactionColor(transaction.transaction_type))}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Balance: {(transaction.balance_free + transaction.balance_paid).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white/5 px-6 py-3 flex items-center justify-between border-t border-white/10">
                  <div className="text-sm text-gray-400">
                    Page {filters.page} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                      disabled={filters.page === 1}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 disabled:opacity-50 flex items-center gap-2">
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>
                    <button onClick={() => setFilters({ ...filters, page: Math.min(totalPages, filters.page + 1) })}
                      disabled={filters.page === totalPages}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 disabled:opacity-50 flex items-center gap-2">
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

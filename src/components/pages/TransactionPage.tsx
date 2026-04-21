import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Search, 
  IndianRupee, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Landmark
} from 'lucide-react';
import { Account } from '../../types';

export default function TransactionPage({ mode }: { mode: 'DEPOSIT' | 'WITHDRAW' }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [accountNumber, setAccountNumber] = useState(searchParams.get('ac') || '');
  const [account, setAccount] = useState<Account | null>(null);
  const [searching, setSearching] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const fetchAccount = async () => {
    if (!accountNumber) return;
    setSearching(true);
    setError('');
    try {
      const res = await fetch(`/api/accounts/${accountNumber}`);
      if (res.ok) {
        const data = await res.json();
        setAccount(data);
      } else {
        setAccount(null);
        setError('Account not found');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (accountNumber) fetchAccount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    
    setLoading(true);
    setError('');
    
    const endpoint = mode === 'DEPOSIT' ? 'deposit' : 'withdraw';
    
    try {
      const res = await fetch(`/api/accounts/${account.accountNumber}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: parseFloat(amount),
          description 
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate(`/accounts/${account.accountNumber}`), 2000);
      } else {
        setError(data.error || 'Transaction failed');
      }
    } catch (err) {
      setError('A network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded ${mode === 'DEPOSIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {mode === 'DEPOSIT' ? <ArrowDownCircle className="h-6 w-6" /> : <ArrowUpCircle className="h-6 w-6" />}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary">{mode === 'DEPOSIT' ? 'Inbound Deposit' : 'Outbound Withdrawal'}</h1>
          <p className="text-text-muted text-sm">Processing fiscal adjustment for SAI WORLD BANK registry.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            {/* Account Search */}
            <div className="bank-card p-8 space-y-4">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Verify Relation ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Registry No. (e.g. SWB...)"
                  className="flex-1 px-4 py-2 bg-slate-50 border border-bank-border rounded focus:ring-1 focus:ring-secondary outline-none text-sm font-mono"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
                <button
                  onClick={fetchAccount}
                  disabled={searching}
                  className="bg-primary text-white px-6 py-2 rounded font-bold text-xs uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {searching ? '...' : 'VERIFY'}
                </button>
              </div>

              {account && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-4 mt-4 border-t border-bank-border flex items-center gap-4"
                >
                  <div className="bg-blue-50 p-2 rounded">
                    <Landmark className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary text-sm">{account.fullName}</h4>
                    <p className="text-[10px] text-text-muted uppercase tracking-widest">
                      {account.accountType} • Liquid Balance: ₹ {account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Transaction Form */}
            {account && (
              <motion.form 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="bank-card p-8 space-y-6"
              >
                {error && (
                  <div className="bg-red-50 text-red-700 p-4 rounded border border-red-100 text-sm font-bold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> {error}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest text-slate-700">Adjustment Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-slate-50 border border-bank-border rounded text-2xl font-bold text-primary focus:ring-1 focus:ring-secondary outline-none"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Ledger Description</label>
                  <textarea
                    placeholder="Enter transactional reference memo..."
                    className="w-full px-4 py-2 bg-slate-50 border border-bank-border rounded focus:ring-1 focus:ring-secondary outline-none text-sm h-24 resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded font-bold text-white text-xs uppercase tracking-widest transition-opacity hover:opacity-90 ${
                    mode === 'DEPOSIT' ? 'bg-success' : 'bg-red-600'
                  } disabled:opacity-50`}
                >
                  {loading ? 'PROCESSING...' : `COMMIT ${mode === 'DEPOSIT' ? 'DEPOSIT' : 'WITHDRAWAL'}`}
                </button>
              </motion.form>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="success"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bank-card p-12 text-center"
          >
            <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-primary mb-2">Transaction Committed</h2>
            <p className="text-text-muted text-sm mb-8">
              The {mode === 'DEPOSIT' ? 'inbound' : 'outbound'} entry has been successfully logged to the SAI WORLD BANK core ledger.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

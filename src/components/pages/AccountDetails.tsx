import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useParams, Link } from 'react-router-dom';
import { 
  Landmark, 
  ArrowLeft, 
  History, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  IndianRupee,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { Account } from '../types';

export default function AccountDetails() {
  const { accountNumber } = useParams();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/accounts/${accountNumber}`)
      .then(res => res.json())
      .then(data => setAccount(data))
      .catch(err => console.error("Error fetching account:", err))
      .finally(() => setLoading(false));
  }, [accountNumber]);

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Retrieving account data...</div>;
  }

  if (!account) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Account Not Found</h2>
        <Link to="/accounts" className="text-blue-600 font-bold hover:underline flex items-center justify-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Accounts
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/accounts" className="p-2 bg-white border border-bank-border rounded text-text-muted hover:bg-slate-50 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary">Account Relationship View</h1>
          <p className="text-text-muted text-xs font-mono uppercase">ID: {account.accountNumber}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-6"
        >
          <div className="bank-card overflow-hidden">
            <div className="bg-primary h-16"></div>
            <div className="px-8 pb-8">
              <div className="relative -top-6 flex items-end gap-4">
                <div className="bg-white p-3 rounded border-2 border-primary shadow-sm">
                  <Landmark className="h-8 w-8 text-primary" />
                </div>
                <div className="pb-2">
                  <h2 className="text-xl font-bold text-primary leading-none mb-1">{account.fullName}</h2>
                  <span className={`pill ${
                    account.accountType === 'Savings' ? 'pill-savings' : 'pill-current'
                   }`}>
                    {account.accountType}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4 pt-2">
                <InfoRow label="Email Address" value={account.email} />
                <InfoRow label="Phone Contact" value={account.phone} />
                <InfoRow label="Mailing Address" value={account.address} />
                <InfoRow label="Opening Date" value={format(new Date(account.openingDate), 'dd-MM-yyyy')} />
              </div>
            </div>
          </div>

          <div className="bank-card p-8 bg-secondary border-none text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Landmark className="h-20 w-20" />
            </div>
            <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-2">Available Balance</p>
            <h3 className="text-3xl font-bold mb-8">
              ₹ {account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <div className="flex gap-3">
              <Link 
                to={`/deposit?ac=${account.accountNumber}`}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                DEPOSIT
              </Link>
              <Link 
                to={`/withdraw?ac=${account.accountNumber}`}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                WITHDRAW
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Transaction History */}
        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="bank-card overflow-hidden">
            <div className="px-6 py-4 border-b border-bank-border flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-primary text-sm uppercase tracking-wider">Transaction Ledger</h3>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                {account.transactions.length} Entries recorded
              </span>
            </div>
            
            <div className="overflow-x-auto">
              {account.transactions.length === 0 ? (
                <div className="px-8 py-12 text-center text-text-muted text-sm">No transactional activity.</div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th className="bank-table-header">Reference ID</th>
                      <th className="bank-table-header">Description</th>
                      <th className="bank-table-header text-right">Amount</th>
                      <th className="bank-table-header text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bank-border">
                    {account.transactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 font-mono text-[11px] text-text-muted">{txn.id}</td>
                        <td className="px-6 py-3">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-text-dark">{txn.description}</span>
                            <span className="text-[10px] text-text-muted uppercase tracking-tighter">
                              {format(new Date(txn.timestamp), 'dd-MM-yyyy HH:mm')}
                            </span>
                          </div>
                        </td>
                        <td className={`px-6 py-3 text-xs font-bold text-right ${
                          txn.type === 'DEPOSIT' ? 'text-success' : 'text-red-600'
                        }`}>
                          {txn.type === 'DEPOSIT' ? '+' : '-'} ₹ {txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-3 text-xs font-bold text-primary text-right">
                          ₹ {txn.balanceAfter.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{label}</p>
      <p className="text-sm font-medium text-text-dark">{value}</p>
    </div>
  );
}

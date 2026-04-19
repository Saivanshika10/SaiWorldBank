import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Users, ArrowRight, IndianRupee, Landmark, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Account } from '../types';

export default function AccountList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => setAccounts(data))
      .catch(err => console.error("Error fetching accounts:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredAccounts = accounts.filter(acc => 
    acc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-1">Registered Accounts Summary</h1>
          <p className="text-text-muted text-sm">Managing all customer portfolio registry.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search registry..."
              className="pl-10 pr-4 py-2 bg-white border border-bank-border rounded-lg focus:ring-1 focus:ring-secondary outline-none text-sm shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link to="/open" className="bank-btn-primary flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> New Account
          </Link>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bank-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="bank-table-header">Account Number</th>
                <th className="bank-table-header">Full Name</th>
                <th className="bank-table-header">Type</th>
                <th className="bank-table-header text-right">Balance</th>
                <th className="bank-table-header text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bank-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted">Loading registry...</td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted">No records found.</td>
                </tr>
              ) : (
                filteredAccounts.map((account) => (
                  <tr key={account.accountNumber} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-text-muted">{account.accountNumber}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-text-dark">{account.fullName}</td>
                    <td className="px-6 py-4">
                      <span className={`pill ${
                        account.accountType === 'Savings' ? 'pill-savings' : 'pill-current'
                      }`}>
                        {account.accountType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-primary text-right">
                      ₹ {account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link 
                        to={`/accounts/${account.accountNumber}`}
                        className="text-secondary hover:underline font-semibold text-xs"
                      >
                        VIEW DETAILS
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 text-slate-500 mb-2">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Search, History, ArrowRight, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface GlobalTransaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  balanceAfter: number;
  description: string;
  timestamp: string;
  accountNumber: string;
  accountName: string;
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<GlobalTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(err => console.error("Error fetching transactions:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredTransactions = transactions.filter(txn => 
    txn.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-1">Global Transaction Ledger</h1>
          <p className="text-text-muted text-sm">Comprehensive audit of all SAI WORLD BANK fiscal activities.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Filter ledger..."
              className="pl-10 pr-4 py-2 bg-white border border-bank-border rounded-lg focus:ring-1 focus:ring-secondary outline-none text-sm shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bank-btn-primary flex items-center gap-2">
            <Download className="h-4 w-4" /> EXPORT CSV
          </button>
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
                <th className="bank-table-header">Timestamp</th>
                <th className="bank-table-header">Reference ID</th>
                <th className="bank-table-header">Entity / Account</th>
                <th className="bank-table-header">Motive/Description</th>
                <th className="bank-table-header text-right">Adjustment</th>
                <th className="bank-table-header">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bank-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-muted">Loading ledger entries...</td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-muted">No records identified.</td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-[11px] font-mono text-text-muted">
                      {format(new Date(txn.timestamp), 'dd-MM-yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-text-muted">{txn.id}</td>
                    <td className="px-6 py-4">
                      <Link 
                        to={`/accounts/${txn.accountNumber}`}
                        className="flex flex-col group"
                      >
                        <span className="text-sm font-bold text-text-dark group-hover:text-secondary transition-colors underline decoration-dotted underline-offset-4">
                          {txn.accountName}
                        </span>
                        <span className="text-[10px] text-text-muted font-mono">{txn.accountNumber}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-xs text-text-muted">
                      {txn.description}
                    </td>
                    <td className={`px-6 py-4 text-sm font-bold text-right ${
                      txn.type === 'DEPOSIT' ? 'text-success' : 'text-red-600'
                    }`}>
                      {txn.type === 'DEPOSIT' ? '+' : '-'} ₹ {txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`pill ${
                        txn.type === 'DEPOSIT' ? 'pill-savings' : 'pill-current'
                      } text-[10px]`}>
                        {txn.type}
                      </span>
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

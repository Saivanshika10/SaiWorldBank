import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
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
    async function fetchTransactions() {
      try {
        const res = await fetch('/api/transactions');
        const text = await res.text();

        try {
          const data = JSON.parse(text);
          console.log("Transactions:", data);
          setTransactions(data);
        } catch {
          console.error("❌ Not JSON:", text);
        }

      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(txn =>
    txn.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">

      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Transaction History</h1>

        <div className="relative">
          <Search className="absolute left-2 top-2 h-4 w-4" />
          <input
            className="pl-8 border px-2 py-1"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bank-card">
        <table className="w-full">

          <thead>
            <tr>
              <th>Date</th>
              <th>ID</th>
              <th>Account</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan={4}>Loading...</td></tr>
            ) : filteredTransactions.length === 0 ? (
              <tr><td colSpan={4}>No data</td></tr>
            ) : (
              filteredTransactions.map(txn => (
                <tr key={txn.id}>
                  <td>{format(new Date(txn.timestamp), 'dd-MM-yyyy')}</td>
                  <td>{txn.id}</td>
                  <td>
                    <Link to={`/accounts/${txn.accountNumber}`}>
                      {txn.accountName}
                    </Link>
                  </td>
                  <td>
                    {txn.type === 'DEPOSIT' ? '+' : '-'} ₹ {txn.amount}
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </motion.div>
    </div>
  );
}

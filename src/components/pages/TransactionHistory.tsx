import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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
        const res = await fetch(`${BASE_URL}/transactions`);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log("Transactions:", data);

        setTransactions(data);

      } catch (err) {
        console.error("❌ Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(txn =>
    txn.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">

        <h1 className="text-2xl font-bold">
          Transaction History
        </h1>

        <div className="relative">
          <Search className="absolute left-2 top-2 h-4 w-4 text-gray-500" />

          <input
            className="pl-8 border px-2 py-1 rounded"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

      </div>

      {/* TABLE */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bank-card"
      >
        <table className="w-full border-collapse">

          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Date</th>
              <th className="p-2">ID</th>
              <th className="p-2">Account</th>
              <th className="p-2">Description</th>
              <th className="p-2 text-right">Amount</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td colSpan={5} className="text-center p-4">
                  Loading...
                </td>
              </tr>

            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-4">
                  No transactions found
                </td>
              </tr>

            ) : (
              filteredTransactions.map((txn) => (
                <tr key={txn.id} className="border-b hover:bg-gray-50">

                  <td className="p-2 text-sm">
                    {format(new Date(txn.timestamp), 'dd-MM-yyyy HH:mm')}
                  </td>

                  <td className="p-2 font-mono text-xs">
                    {txn.id}
                  </td>

                  <td className="p-2">
                    <Link
                      to={`/accounts/${txn.accountNumber}`}
                      className="text-blue-600 hover:underline"
                    >
                      {txn.accountName}
                    </Link>
                  </td>

                  <td className="p-2 text-sm text-gray-600">
                    {txn.description}
                  </td>

                  <td
                    className={`p-2 text-right font-bold ${
                      txn.type === 'DEPOSIT'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
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

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Search, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Account } from '../types';

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function AccountList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const res = await fetch(`${BASE_URL}/accounts`);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log("Accounts:", data);

        setAccounts(data);
      } catch (err) {
        console.error("❌ Error fetching accounts:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAccounts();
  }, []);

  const filteredAccounts = accounts.filter(acc =>
    acc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-1">
            Registered Accounts Summary
          </h1>
          <p className="text-text-muted text-sm">
            Managing all customer portfolio registry.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              <Search className="h-4 w-4" />
            </div>

            <input
              type="text"
              placeholder="Search registry..."
              className="pl-10 pr-4 py-2 bg-white border border-bank-border rounded-lg outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Link
            to="/open"
            className="bank-btn-primary flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            New Account
          </Link>
        </div>
      </div>

      {/* TABLE */}
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
                  <td colSpan={5} className="text-center py-10">
                    Loading accounts...
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    No records found
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => (
                  <tr key={account.accountNumber} className="hover:bg-gray-50">

                    <td className="px-6 py-4 font-mono text-sm">
                      {account.accountNumber}
                    </td>

                    <td className="px-6 py-4 font-semibold">
                      {account.fullName}
                    </td>

                    <td className="px-6 py-4">
                      {account.accountType}
                    </td>

                    <td className="px-6 py-4 text-right font-bold text-green-600">
                      ₹ {account.balance.toLocaleString('en-IN')}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/accounts/${account.accountNumber}`}
                        className="text-blue-500 hover:underline"
                      >
                        View
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

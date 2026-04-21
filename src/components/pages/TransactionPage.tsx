import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  AlertCircle,
  CheckCircle2,
  Landmark
} from 'lucide-react';

interface Account {
  accountNumber: string;
  fullName: string;
  accountType: string;
  balance: number;
}

const BASE_URL = "/api"; // ✅ FIXED

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

  // =========================
  // FETCH ACCOUNT
  // =========================
  const fetchAccount = async () => {
    if (!accountNumber) return;

    setSearching(true);
    setError('');

    try {
      const res = await fetch(`${BASE_URL}/accounts/${accountNumber}`);

      if (!res.ok) {
        throw new Error("Account not found");
      }

      const data = await res.json();
      setAccount(data);

    } catch (err) {
      setAccount(null);
      setError("❌ Account not found or server error");
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (accountNumber) fetchAccount();
  }, []);

  // =========================
  // HANDLE TRANSACTION
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    setLoading(true);
    setError('');

    const endpoint = mode === 'DEPOSIT' ? 'deposit' : 'withdraw';

    try {
      const res = await fetch(
        `${BASE_URL}/accounts/${account.accountNumber}/${endpoint}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Number(amount),
            description
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Transaction failed");
      }

      setSuccess(true);

      setTimeout(() => {
        navigate(`/accounts/${account.accountNumber}`);
      }, 1500);

    } catch (err: any) {
      setError(err.message || "❌ Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded ${mode === 'DEPOSIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {mode === 'DEPOSIT' ? <ArrowDownCircle /> : <ArrowUpCircle />}
        </div>

        <div>
          <h1 className="text-2xl font-bold">
            {mode === 'DEPOSIT' ? 'Deposit Funds' : 'Withdraw Funds'}
          </h1>
        </div>
      </div>

      <AnimatePresence>

        {!success ? (
          <motion.div className="space-y-6">

            {/* SEARCH */}
            <div className="bank-card p-6">
              <div className="flex gap-2">
                <input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter Account Number"
                  className="flex-1 border px-3 py-2"
                />

                <button onClick={fetchAccount} className="bg-blue-600 text-white px-4">
                  {searching ? "..." : "Search"}
                </button>
              </div>

              {account && (
                <div className="mt-4 flex items-center gap-3">
                  <Landmark />
                  <div>
                    <p className="font-bold">{account.fullName}</p>
                    <p className="text-sm">₹ {account.balance}</p>
                  </div>
                </div>
              )}
            </div>

            {/* FORM */}
            {account && (
              <form onSubmit={handleSubmit} className="bank-card p-6 space-y-4">

                {error && (
                  <div className="text-red-600 flex gap-2">
                    <AlertCircle /> {error}
                  </div>
                )}

                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border p-2"
                  required
                />

                <textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border p-2"
                />

                <button
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2"
                >
                  {loading ? "Processing..." : "Submit"}
                </button>

              </form>
            )}

          </motion.div>
        ) : (
          <motion.div className="text-center">
            <CheckCircle2 className="mx-auto text-green-600" />
            <p>Transaction Successful</p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

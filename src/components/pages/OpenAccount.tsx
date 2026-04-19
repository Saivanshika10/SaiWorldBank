import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, Landmark, IndianRupee, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OpenAccount() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    accountType: 'Savings',
    initialDeposit: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          initialDeposit: parseFloat(formData.initialDeposit)
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate(`/accounts/${data.accountNumber}`), 2000);
      } else {
        setError(data.error || 'Failed to open account');
      }
    } catch (err) {
      setError('A network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Account Opened Successfully!</h2>
          <p className="text-slate-600 mb-8">Welcome to SAI WORLD BANK. We are redirecting you to your account details...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-1">Open New Consumer Account</h1>
        <p className="text-text-muted text-sm">Register new relationship with SAI WORLD BANK.</p>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit} 
        className="bank-card overflow-hidden"
      >
        <div className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded border border-red-100 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <InputField 
              label="Full Name" 
              name="fullName" 
              placeholder="e.g. Rajesh Kumar Sharma"
              value={formData.fullName}
              onChange={(v) => setFormData({...formData, fullName: v})}
              required
            />
            <InputField 
              label="Email Address" 
              name="email" 
              type="email"
              placeholder="rajesh.s@example.com"
              value={formData.email}
              onChange={(v) => setFormData({...formData, email: v})}
              required
            />
            <InputField 
              label="Phone Number" 
              name="phone" 
              placeholder="+91 XXXXX XXXXX"
              value={formData.phone}
              onChange={(v) => setFormData({...formData, phone: v})}
              required
            />
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Account Type</label>
              <select
                className="w-full px-4 py-2 bg-slate-50 border border-bank-border rounded focus:ring-1 focus:ring-secondary outline-none text-sm"
                value={formData.accountType}
                onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                required
              >
                <option value="Savings">Savings Account</option>
                <option value="Current">Current Account</option>
              </select>
            </div>
          </div>

          <InputField 
            label="Mailing Address" 
            name="address" 
            placeholder="Complete street address"
            value={formData.address}
            onChange={(v) => setFormData({...formData, address: v})}
            required
          />

          <div className="bg-slate-50 p-6 rounded border border-bank-border">
            <InputField 
              label="Initial Deposit Amount (Min ₹500)" 
              name="initialDeposit" 
              type="number"
              min="500"
              placeholder="Enter amount"
              value={formData.initialDeposit}
              onChange={(v) => setFormData({...formData, initialDeposit: v})}
              required
            />
          </div>
        </div>

        <div className="bg-slate-50 px-8 py-4 border-t border-bank-border flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bank-btn-primary flex items-center gap-2"
          >
            {loading ? 'Processing...' : 'CREATE ACCOUNT'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </motion.form>
    </div>
  );
}

function InputField({ label, name, type = 'text', placeholder, value, onChange, required, min }: any) {
  return (
    <div className="space-y-1 flex-grow">
      <label className="text-xs font-bold text-text-muted uppercase tracking-wider" htmlFor={name}>{label}</label>
      <input
        id={name}
        type={type}
        min={min}
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-slate-50 border border-bank-border rounded focus:ring-1 focus:ring-secondary outline-none text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}

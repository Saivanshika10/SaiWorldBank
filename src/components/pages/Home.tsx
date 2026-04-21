import { useEffect, useState, ReactNode } from 'react';
import { motion } from 'motion/react';
import { Landmark, Users, CreditCard, ShieldCheck, ArrowRight, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Account } from '../../types';
import { getStats } from "../../api/api";

export default function Home() {
  const [stats, setStats] = useState<BankStats | null>(null);

  useEffect(() => {
    getStats().then((data) => {
      setStats(data);
    }).catch((err) => {
      console.error("Error fetching stats:", err);
    });
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">Global Banking Dashboard</h2>
        <p className="text-text-muted">Welcome to the SAI WORLD BANK administration portal.</p>
      </div>

      {/* Stats Section */}
      <section className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="bank-card p-6"
        >
          <div className="stat-label flex items-center gap-2">
            <Users className="h-4 w-4" /> Total Customers
          </div>
          <div className="stat-value">
            {stats ? stats.totalCustomers.toLocaleString() : 'Loading...'}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bank-card p-6"
        >
          <div className="stat-label flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Total Bank Balance
          </div>
          <div className="stat-value">
            ₹ {stats ? stats.totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : 'Loading...'}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bank-card p-6"
        >
          <div className="stat-label flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> System Status
          </div>
          <div className="text-2xl font-bold text-success flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6" /> Operational
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="space-y-6">
        <h3 className="text-lg font-bold text-primary">Quick Management</h3>

        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Landmark className="h-6 w-6 text-secondary" />}
            title="Open New Account"
            description="Register new customers and assign SWB account numbers instantly."
            to="/open"
          />
          <FeatureCard
            icon={<ArrowRight className="h-6 w-6 text-secondary" />}
            title="Deposit Funds"
            description="Process incoming deposits and update account statements in real-time."
            to="/deposit"
          />
          <FeatureCard
            icon={<CreditCard className="h-6 w-6 text-secondary" />}
            title="Withdrawal Service"
            description="Manage customer withdrawals with automated balance verification."
            to="/withdraw"
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  to
}: {
  icon: ReactNode;
  title: string;
  description: string;
  to: string;
}) {
  return (
    <Link to={to} className="bank-card p-8 hover:bg-slate-50 transition-colors group">
      <div className="bg-slate-100 p-3 rounded w-fit mb-6">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
        {title}
        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </h3>
      <p className="text-text-muted text-sm leading-relaxed">{description}</p>
    </Link>
  );
}

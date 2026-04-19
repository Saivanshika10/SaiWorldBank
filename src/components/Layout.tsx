import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Layout as LayoutIcon, Users, PlusCircle, ArrowDownCircle, ArrowUpCircle, History, Landmark } from 'lucide-react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-bank-bg font-sans text-text-dark">
      {/* Header */}
      <header className="h-[70px] bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-between px-10 shadow-md sticky top-0 z-50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary font-bold text-xl border-2 border-accent">
            S
          </div>
          <div>
            <h1 className="text-[22px] font-bold tracking-wider leading-none">SAI WORLD BANK</h1>
            <p className="text-[12px] opacity-80 italic">Your Trusted Banking Partner</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <span className="text-sm font-medium">Admin Dashboard</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex w-[220px] bg-white border-r border-bank-border flex-col py-5 gap-1 shrink-0">
          <SidebarItem to="/" label="Home" />
          <SidebarItem to="/accounts" label="All Accounts" />
          <SidebarItem to="/transactions" label="Transaction Logs" />
          <SidebarItem to="/open" label="Open New Account" />
          <SidebarItem to="/deposit" label="Deposit Funds" />
          <SidebarItem to="/withdraw" label="Withdraw Funds" />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
          <div className="max-w-7xl w-full mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="h-10 bg-white border-t border-bank-border flex items-center justify-center text-[12px] text-text-muted flex-shrink-0">
        &copy; {new Date().getFullYear()} SAI WORLD BANK. All Rights Reserved. ISO 9001:2015 Certified Bank.
      </footer>
    </div>
  );
}

function SidebarItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-6 py-3 text-sm flex items-center gap-3 border-l-4 transition-colors ${
          isActive
            ? 'bg-blue-50 text-secondary border-secondary font-semibold'
            : 'text-text-dark border-transparent hover:bg-slate-50'
        }`
      }
    >
      {label}
    </NavLink>
  );
}

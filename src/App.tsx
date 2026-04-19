import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Layout from "./components/Layout";

import Home from './components/pages/Home';
import OpenAccount from './components/pages/OpenAccount';
import AccountList from './components/pages/AccountList';
import AccountDetails from './components/pages/AccountDetails';
import TransactionPage from './components/pages/TransactionPage';
import TransactionHistory from './components/pages/TransactionHistory';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/open" element={<OpenAccount />} />
          <Route path="/accounts" element={<AccountList />} />
          <Route path="/accounts/:accountNumber" element={<AccountDetails />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/deposit" element={<TransactionPage mode="DEPOSIT" />} />
          <Route path="/withdraw" element={<TransactionPage mode="WITHDRAW" />} />
          <Route path="*" element={<div className="text-center py-20 font-bold">404 - SAI WORLD BANK Page Not Found</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import OpenAccount from './pages/OpenAccount';
import AccountList from './pages/AccountList';
import AccountDetails from './pages/AccountDetails';
import TransactionPage from './pages/TransactionPage';
import TransactionHistory from './pages/TransactionHistory';

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

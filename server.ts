import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Account, Transaction, BankStats } from "./src/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory "Database"
  let accounts: Account[] = [
    {
      accountNumber: "SWB20260419001",
      fullName: "Sai Kiran",
      email: "kiran@swb.com",
      phone: "+91 9876543210",
      address: "Hyderabad, India",
      accountType: "Savings",
      balance: 10000.0,
      openingDate: "2026-04-10",
      transactions: [
        {
          id: "SWBTXN20260410001",
          type: "DEPOSIT",
          amount: 10000.0,
          balanceAfter: 10000.0,
          description: "Initial Deposit",
          timestamp: "2026-04-10T10:00:00Z"
        }
      ]
    },
    {
      accountNumber: "SWB20260419002",
      fullName: "Vanshika Sharma",
      email: "vanshika@swb.com",
      phone: "+91 8765432109",
      address: "Mumbai, India",
      accountType: "Current",
      balance: 50000.0,
      openingDate: "2026-04-12",
      transactions: [
        {
          id: "SWBTXN20260412001",
          type: "DEPOSIT",
          amount: 50000.0,
          balanceAfter: 50000.0,
          description: "Opening Deposit",
          timestamp: "2026-04-12T14:30:00Z"
        }
      ]
    }
  ];

  // Helper to generate account numbers
  function generateAccountNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SWB${timestamp}${random}`;
  }

  // Helper to generate transaction IDs
  function generateTransactionID() {
    const timestamp = Date.now();
    return `SWBTXN${timestamp}`;
  }

  // API Routes
  app.get("/api/stats", (req, res) => {
    const totalCustomers = accounts.length;
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    res.json({ totalCustomers, totalBalance });
  });

  app.get("/api/accounts", (req, res) => {
    res.json(accounts);
  });

  app.post("/api/accounts", (req, res) => {
    const { fullName, email, phone, address, accountType, initialDeposit } = req.body;

    if (!fullName || !email || !phone || !address || !accountType || initialDeposit === undefined) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (initialDeposit < 500) {
      return res.status(400).json({ error: "Initial deposit must be at least ₹500" });
    }

    if (accounts.some(a => a.email === email)) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const newAccount: Account = {
      accountNumber: generateAccountNumber(),
      fullName,
      email,
      phone,
      address,
      accountType,
      balance: initialDeposit,
      openingDate: new Date().toISOString().split('T')[0],
      transactions: [
        {
          id: generateTransactionID(),
          type: "DEPOSIT",
          amount: initialDeposit,
          balanceAfter: initialDeposit,
          description: "Initial Deposit",
          timestamp: new Date().toISOString()
        }
      ]
    };

    accounts.push(newAccount);
    res.status(201).json(newAccount);
  });

  app.get("/api/accounts/:accountNumber", (req, res) => {
    const account = accounts.find(a => a.accountNumber === req.params.accountNumber);
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }
    res.json(account);
  });

  app.get("/api/transactions", (req, res) => {
    // Collect all transactions from all accounts
    const allTransactions = accounts.flatMap(acc => 
      acc.transactions.map(txn => ({
        ...txn,
        accountNumber: acc.accountNumber,
        accountName: acc.fullName
      }))
    );
    
    // Sort by timestamp descending
    allTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    res.json(allTransactions);
  });

  app.post("/api/accounts/:accountNumber/deposit", (req, res) => {
    const { amount, description } = req.body;
    const account = accounts.find(a => a.accountNumber === req.params.accountNumber);

    if (!account) return res.status(404).json({ error: "Account not found" });
    if (amount <= 0) return res.status(400).json({ error: "Amount must be positive" });

    account.balance += amount;
    const txn: Transaction = {
      id: generateTransactionID(),
      type: "DEPOSIT",
      amount,
      balanceAfter: account.balance,
      description: description || "Deposit",
      timestamp: new Date().toISOString()
    };
    account.transactions.unshift(txn);

    res.json({ message: "Deposit successful", account });
  });

  app.post("/api/accounts/:accountNumber/withdraw", (req, res) => {
    const { amount, description } = req.body;
    const account = accounts.find(a => a.accountNumber === req.params.accountNumber);

    if (!account) return res.status(404).json({ error: "Account not found" });
    if (amount <= 0) return res.status(400).json({ error: "Amount must be positive" });
    if (account.balance - amount < 100) {
      return res.status(400).json({ error: "Insufficient balance. Minimum balance of ₹100 required after withdrawal." });
    }

    account.balance -= amount;
    const txn: Transaction = {
      id: generateTransactionID(),
      type: "WITHDRAWAL",
      amount,
      balanceAfter: account.balance,
      description: description || "Withdrawal",
      timestamp: new Date().toISOString()
    };
    account.transactions.unshift(txn);

    res.json({ message: "Withdrawal successful", account });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

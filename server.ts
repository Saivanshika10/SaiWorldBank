import express from "express";
import cors from "cors";
import { Account, Transaction } from "./src/types";

async function startServer() {
  const app = express();

  // ✅ FORCE CORS (no more errors)
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
  });

  app.use(cors());
  app.use(express.json());

  const PORT = process.env.PORT || 3000;

  // ✅ Test route (optional but useful)
  app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
  });

  // In-memory Database
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

  function generateAccountNumber() {
    return `SWB${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }

  function generateTransactionID() {
    return `SWBTXN${Date.now()}`;
  }

  // ✅ API Routes

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
      return res.status(400).json({ error: "Minimum ₹500 required" });
    }

    if (accounts.some(a => a.email === email)) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const newAccount: Account = {
      accountNumber: generateAccountNumber(),
      fullName,
      email,
      phone,
      address,
      accountType,
      balance: initialDeposit,
      openingDate: new Date().toISOString().split("T")[0],
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
    if (!account) return res.status(404).json({ error: "Not found" });
    res.json(account);
  });

  app.get("/api/transactions", (req, res) => {
    const allTransactions = accounts.flatMap(acc =>
      acc.transactions.map(txn => ({
        ...txn,
        accountNumber: acc.accountNumber,
        accountName: acc.fullName
      }))
    );

    allTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json(allTransactions);
  });

  app.post("/api/accounts/:accountNumber/deposit", (req, res) => {
    const { amount, description } = req.body;
    const account = accounts.find(a => a.accountNumber === req.params.accountNumber);

    if (!account) return res.status(404).json({ error: "Not found" });
    if (amount <= 0) return res.status(400).json({ error: "Invalid amount" });

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

    if (!account) return res.status(404).json({ error: "Not found" });
    if (amount <= 0) return res.status(400).json({ error: "Invalid amount" });

    if (account.balance - amount < 100) {
      return res.status(400).json({ error: "Minimum ₹100 balance required" });
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

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

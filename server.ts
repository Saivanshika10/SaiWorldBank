import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Account, Transaction } from "./src/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "data.json");

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const PORT = process.env.PORT || 3000;

  // =========================
  // FILE STORAGE FUNCTIONS
  // =========================
  function loadData(): Account[] {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify({ accounts: [] }, null, 2));
    }
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw).accounts;
  }

  function saveData(accounts: Account[]) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ accounts }, null, 2));
  }

  let accounts: Account[] = loadData();

  // =========================
  // HELPERS
  // =========================
  function generateAccountNumber() {
    return `SWB${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }

  function generateTransactionID() {
    return `SWBTXN${Date.now()}`;
  }

  // =========================
  // ROUTES
  // =========================

  // Stats
  app.get("/api/stats", (req, res) => {
    const totalCustomers = accounts.length;
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    res.json({ totalCustomers, totalBalance });
  });

  // Get all accounts
  app.get("/api/accounts", (req, res) => {
    res.json(accounts);
  });

  // Create account
  app.post("/api/accounts", (req, res) => {
    const { fullName, email, phone, address, accountType, initialDeposit } = req.body;

    if (!fullName || !email || !phone || !address || !accountType || initialDeposit === undefined) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (initialDeposit < 500) {
      return res.status(400).json({ error: "Minimum ₹500 required" });
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
          timestamp: new Date().toISOString(),
        },
      ],
    };

    accounts.push(newAccount);
    saveData(accounts);

    res.status(201).json(newAccount);
  });

  // Get single account
  app.get("/api/accounts/:accountNumber", (req, res) => {
    const account = accounts.find(a => a.accountNumber === req.params.accountNumber);
    if (!account) return res.status(404).json({ error: "Not found" });
    res.json(account);
  });

  // Transactions
  app.get("/api/transactions", (req, res) => {
    const allTransactions = accounts.flatMap(acc =>
      acc.transactions.map(txn => ({
        ...txn,
        accountNumber: acc.accountNumber,
        accountName: acc.fullName,
      }))
    );

    allTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json(allTransactions);
  });

  // Deposit
  app.post("/api/accounts/:accountNumber/deposit", (req, res) => {
    const { amount } = req.body;
    const account = accounts.find(a => a.accountNumber === req.params.accountNumber);

    if (!account) return res.status(404).json({ error: "Account not found" });

    account.balance += amount;

    const txn: Transaction = {
      id: generateTransactionID(),
      type: "DEPOSIT",
      amount,
      balanceAfter: account.balance,
      description: "Deposit",
      timestamp: new Date().toISOString(),
    };

    account.transactions.unshift(txn);
    saveData(accounts);

    res.json(account);
  });

  // Withdraw
  app.post("/api/accounts/:accountNumber/withdraw", (req, res) => {
    const { amount } = req.body;
    const account = accounts.find(a => a.accountNumber === req.params.accountNumber);

    if (!account) return res.status(404).json({ error: "Account not found" });

    if (account.balance - amount < 100) {
      return res.status(400).json({ error: "Minimum ₹100 balance required" });
    }

    account.balance -= amount;

    const txn: Transaction = {
      id: generateTransactionID(),
      type: "WITHDRAWAL",
      amount,
      balanceAfter: account.balance,
      description: "Withdrawal",
      timestamp: new Date().toISOString(),
    };

    account.transactions.unshift(txn);
    saveData(accounts);

    res.json(account);
  });

  // =========================

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

type Transaction = {
  id: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  amount: number;
  balanceAfter: number;
  description: string;
  timestamp: string;
};

type Account = {
  accountNumber: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  accountType: string;
  balance: number;
  openingDate: string;
  transactions: Transaction[];
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 IMPORTANT: absolute path (Render safe)
const DATA_FILE = path.join(__dirname, "data.json");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// =========================
// FILE HANDLING
// =========================

function loadData(): Account[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify({ accounts: [] }, null, 2));
    }

    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw).accounts || [];
  } catch (err) {
    console.log("Error reading data:", err);
    return [];
  }
}

function saveData(accounts: Account[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ accounts }, null, 2));
  } catch (err) {
    console.log("Error saving data:", err);
  }
}

let accounts: Account[] = loadData();

// =========================
// HELPERS
// =========================

const generateAccountNumber = () =>
  `SWB${Date.now()}${Math.floor(Math.random() * 1000)}`;

const generateTransactionID = () =>
  `SWBTXN${Date.now()}${Math.floor(Math.random() * 100)}`;

// =========================
// API ROUTES
// =========================

// Stats
app.get("/api/stats", (req, res) => {
  res.json({
    totalCustomers: accounts.length,
    totalBalance: accounts.reduce((sum, a) => sum + a.balance, 0),
  });
});

// All accounts
app.get("/api/accounts", (req, res) => {
  res.json(accounts);
});

// Create account
app.post("/api/accounts", (req, res) => {
  const { fullName, email, phone, address, accountType, initialDeposit } = req.body;

  if (!fullName || !email || !phone || !address || !accountType) {
    return res.status(400).json({ error: "All fields required" });
  }

  if (Number(initialDeposit) < 500) {
    return res.status(400).json({ error: "Minimum ₹500 required" });
  }

  const newAccount: Account = {
    accountNumber: generateAccountNumber(),
    fullName,
    email,
    phone,
    address,
    accountType,
    balance: Number(initialDeposit),
    openingDate: new Date().toISOString().split("T")[0],
    transactions: [
      {
        id: generateTransactionID(),
        type: "DEPOSIT",
        amount: Number(initialDeposit),
        balanceAfter: Number(initialDeposit),
        description: "Initial Deposit",
        timestamp: new Date().toISOString(),
      },
    ],
  };

  accounts.push(newAccount);
  saveData(accounts);

  res.status(201).json(newAccount);
});

// Single account
app.get("/api/accounts/:accountNumber", (req, res) => {
  const account = accounts.find(
    (a) => a.accountNumber === req.params.accountNumber
  );

  if (!account) return res.status(404).json({ error: "Not found" });

  res.json(account);
});

// All transactions
app.get("/api/transactions", (req, res) => {
  const all = accounts.flatMap((acc) =>
    acc.transactions.map((txn) => ({
      ...txn,
      accountNumber: acc.accountNumber,
      accountName: acc.fullName,
    }))
  );

  all.sort(
    (a, b) =>
      new Date(b.timestamp).getTime() -
      new Date(a.timestamp).getTime()
  );

  res.json(all);
});

// Deposit
app.post("/api/accounts/:accountNumber/deposit", (req, res) => {
  const { amount } = req.body;

  const account = accounts.find(
    (a) => a.accountNumber === req.params.accountNumber
  );

  if (!account) return res.status(404).json({ error: "Not found" });

  account.balance += Number(amount);

  account.transactions.unshift({
    id: generateTransactionID(),
    type: "DEPOSIT",
    amount: Number(amount),
    balanceAfter: account.balance,
    description: "Deposit",
    timestamp: new Date().toISOString(),
  });

  saveData(accounts);
  res.json(account);
});

// Withdraw
app.post("/api/accounts/:accountNumber/withdraw", (req, res) => {
  const { amount } = req.body;

  const account = accounts.find(
    (a) => a.accountNumber === req.params.accountNumber
  );

  if (!account) return res.status(404).json({ error: "Not found" });

  if (account.balance - Number(amount) < 100) {
    return res.status(400).json({ error: "Minimum ₹100 balance required" });
  }

  account.balance -= Number(amount);

  account.transactions.unshift({
    id: generateTransactionID(),
    type: "WITHDRAWAL",
    amount: Number(amount),
    balanceAfter: account.balance,
    description: "Withdrawal",
    timestamp: new Date().toISOString(),
  });

  saveData(accounts);
  res.json(account);
});

// =========================
// 🔥 SERVE FRONTEND (IMPORTANT)
// =========================

const distPath = path.join(__dirname, "dist");

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// =========================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

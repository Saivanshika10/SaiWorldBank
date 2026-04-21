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

const DATA_FILE = path.resolve(__dirname, "data.json");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// =========================
// FILE FUNCTIONS
// =========================

function loadData(): Account[] {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ accounts: [] }, null, 2));
  }

  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw).accounts || [];
}

function saveData(accounts: Account[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ accounts }, null, 2));
}

function getAccounts(): Account[] {
  return loadData(); // 🔥 ALWAYS fresh data
}

// =========================
// HELPERS
// =========================

const generateAccountNumber = () =>
  `SWB${Date.now()}${Math.floor(Math.random() * 1000)}`;

const generateTransactionID = () =>
  `TXN${Date.now()}${Math.floor(Math.random() * 100)}`;

// =========================
// API ROUTES
// =========================

app.get("/api/stats", (req, res) => {
  const accounts = getAccounts();

  res.json({
    totalCustomers: accounts.length,
    totalBalance: accounts.reduce((sum, a) => sum + a.balance, 0),
  });
});

app.get("/api/accounts", (req, res) => {
  res.json(getAccounts());
});

app.post("/api/accounts", (req, res) => {
  const accounts = getAccounts();

  const { fullName, email, phone, address, accountType, initialDeposit } = req.body;

  if (!fullName || !email || !phone || !address || !accountType) {
    return res.status(400).json({ error: "All fields required" });
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

app.get("/api/accounts/:accountNumber", (req, res) => {
  const accounts = getAccounts();

  const account = accounts.find(a => a.accountNumber === req.params.accountNumber);

  if (!account) return res.status(404).json({ error: "Not found" });

  res.json(account);
});

app.get("/api/transactions", (req, res) => {
  const accounts = getAccounts();

  const all = accounts.flatMap(acc =>
    acc.transactions.map(txn => ({
      ...txn,
      accountNumber: acc.accountNumber,
      accountName: acc.fullName,
    }))
  );

  all.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  res.json(all);
});

app.post("/api/accounts/:accountNumber/deposit", (req, res) => {
  const accounts = getAccounts();

  const { amount } = req.body;
  const account = accounts.find(a => a.accountNumber === req.params.accountNumber);

  if (!account) return res.status(404).json({ error: "Not found" });

  account.balance += Number(amount);

  account.transactions.unshift({
    id: generateTransactionID(),
    type: "DEPOSIT",
    amount,
    balanceAfter: account.balance,
    description: "Deposit",
    timestamp: new Date().toISOString(),
  });

  saveData(accounts);
  res.json(account);
});

app.post("/api/accounts/:accountNumber/withdraw", (req, res) => {
  const accounts = getAccounts();

  const { amount } = req.body;
  const account = accounts.find(a => a.accountNumber === req.params.accountNumber);

  if (!account) return res.status(404).json({ error: "Not found" });

  if (account.balance - amount < 100) {
    return res.status(400).json({ error: "Minimum ₹100 balance required" });
  }

  account.balance -= Number(amount);

  account.transactions.unshift({
    id: generateTransactionID(),
    type: "WITHDRAWAL",
    amount,
    balanceAfter: account.balance,
    description: "Withdrawal",
    timestamp: new Date().toISOString(),
  });

  saveData(accounts);
  res.json(account);
});

// =========================
// SERVE FRONTEND
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

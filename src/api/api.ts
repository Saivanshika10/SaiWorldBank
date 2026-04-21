const BASE_URL = "/api";

// ==========================

export async function getStats() {
  const res = await fetch(`${BASE_URL}/stats`);
  return res.json();
}

export async function getAccounts() {
  const res = await fetch(`${BASE_URL}/accounts`);
  return res.json();
}

export async function getTransactions() {
  const res = await fetch(`${BASE_URL}/transactions`);
  return res.json();
}

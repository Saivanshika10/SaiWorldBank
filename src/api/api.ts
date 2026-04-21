const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function safeFetch(url: string) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json();
}

export async function getStats() {
  return safeFetch(`${BASE_URL}/stats`);
}

export async function getAccounts() {
  return safeFetch(`${BASE_URL}/accounts`);
}

export async function getTransactions() {
  return safeFetch(`${BASE_URL}/transactions`);
}

const BASE_URL = "http://localhost:3000/api";

async function fetchData(url: string) {
  const res = await fetch(url);

  const text = await res.text(); // 👈 important

  try {
    return JSON.parse(text); // try parsing JSON
  } catch {
    console.error("Not JSON response:", text); // 👈 will show actual problem
    throw new Error("Invalid JSON response");
  }
}

export function getStats() {
  return fetchData(`${BASE_URL}/stats`);
}

export function getAccounts() {
  return fetchData(`${BASE_URL}/accounts`);
}

export function getTransactions() {
  return fetchData(`${BASE_URL}/transactions`);
}

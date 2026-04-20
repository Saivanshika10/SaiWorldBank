export async function getStats() {
  const res = await fetch("http://localhost:3000/api/stats");
  return res.json();
}

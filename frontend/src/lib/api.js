const BASE = import.meta.env.VITE_API_URL;

export async function wrapAPI(data) {
  const res = await fetch(`${BASE}/wrap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to wrap API");
  return json;
}

export async function getEarnings(apiId) {
  const url = apiId ? `${BASE}/earnings/${apiId}` : `${BASE}/earnings`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function runAgentDemo(apiId, prompt) {
  const res = await fetch(`${BASE}/api/demo/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiId, prompt }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to run agent demo");
  return json;
}

export async function getAgentWallet() {
  const res = await fetch(`${BASE}/api/demo/agent`);
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json;
}

export async function listWrappedAPIs() {
  const res = await fetch(`${BASE}/wrap/list`);
  if (!res.ok) throw new Error("Failed to fetch wrapped APIs");
  return res.json();
}

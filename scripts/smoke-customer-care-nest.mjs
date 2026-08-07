const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:7002/api").replace(/\/$/, "");
const token = process.env.CUSTOMER_CARE_TEST_TOKEN || "";

if (!token) {
  throw new Error("Set CUSTOMER_CARE_TEST_TOKEN to a valid Nest access token before running this smoke test.");
}

async function request(path, init = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  if (!response.ok) throw new Error(`${path} -> HTTP ${response.status}: ${JSON.stringify(body)}`);
  return body?.data ?? body;
}

const health = await request("/customer-care/health");
console.log("[OK] Nest Customer Care health", health.status);

const conversations = await request("/customer-care/conversations?limit=5");
if (!Array.isArray(conversations.items)) throw new Error("Conversation response does not contain items[]");
console.log(`[OK] Loaded ${conversations.items.length} conversations through Nest`);

if (conversations.items[0]?.id) {
  const id = encodeURIComponent(conversations.items[0].id);
  const messages = await request(`/customer-care/conversations/${id}/messages?limit=5`);
  if (!Array.isArray(messages.items)) throw new Error("Message response does not contain items[]");
  console.log(`[OK] Loaded ${messages.items.length} messages through Nest`);
}

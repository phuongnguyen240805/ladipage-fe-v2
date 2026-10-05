import { registeredKediCallback } from "@/lib/backend/sso.server";

export const dynamic = "force-dynamic";

export async function GET() {
  const registration = registeredKediCallback();
  if (!registration) return new Response(null, { status: 503 });
  const origin = registration.target.origin;
  // This page contains no account data or credential. Storage is shared with
  // Ladipage tabs on the same site; only the registered Kedi parent is notified.
  return new Response(`<!doctype html><html><head><meta charset="utf-8"><title>SSO login sync</title></head><body><script>
    window.addEventListener("storage", function(event) {
      if (event.key !== "ladipage:sso-login" || !event.newValue || event.newValue === event.oldValue) return;
      window.parent.postMessage({ type: "ladipage:login-complete", loginId: event.newValue }, ${JSON.stringify(origin)});
    });
  </script></body></html>`, { headers: {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Security-Policy": `default-src 'none'; script-src 'unsafe-inline'; frame-ancestors ${origin}`,
    "Referrer-Policy": "no-referrer",
  } });
}

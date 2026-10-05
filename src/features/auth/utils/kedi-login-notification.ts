export async function notifyKediLogin(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    // The same-origin bridge embedded in Kedi receives storage events from
    // every Ladipage tab, including independent tabs and subsequent logins.
    window.localStorage.setItem("ladipage:sso-login", crypto.randomUUID());
  } catch {
    // Browser storage restrictions must not prevent a successful login.
  }
}

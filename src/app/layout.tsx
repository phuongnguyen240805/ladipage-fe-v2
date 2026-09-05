import './globals.css';
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { QueryProvider } from '@/providers/QueryProvider';
import { MswProvider } from '@/providers/MswProvider';
import { AuthProvider } from '@/features/auth/providers/AuthProvider';

const devRouterHmrRecoveryScript = `
(() => {
  const recoverableErrors = [
    "Router action dispatched before initialization",
    "ChunkLoadError",
    "Loading chunk",
    "Failed to load chunk",
  ];
  const reloadKey = "__ladipage_next_dev_recovery__";

  const recover = (event) => {
    const reason = event.error ?? event.reason ?? event.message;
    const message = String(reason?.message ?? reason ?? "");

    if (!recoverableErrors.some((errorText) => message.includes(errorText))) {
      return;
    }

    event.preventDefault?.();
    event.stopImmediatePropagation?.();

    try {
      const now = Date.now();
      const previousReload = Number(sessionStorage.getItem(reloadKey) ?? 0);

      if (now - previousReload < 10_000) {
        return;
      }

      sessionStorage.setItem(reloadKey, String(now));
    } catch {
      // A hard reload is still the safest recovery if storage is unavailable.
    }

    window.location.reload();
  };

  window.addEventListener("error", recover, true);
  window.addEventListener("unhandledrejection", recover, true);
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {process.env.NODE_ENV === "development" && (
        <head>
          <script dangerouslySetInnerHTML={{ __html: devRouterHmrRecoveryScript }} />
        </head>
      )}
      <body className="font-sans dark:bg-gray-900">
        <ThemeProvider>
          <MswProvider>
            <QueryProvider>
              <AuthProvider>
                <SidebarProvider>{children}</SidebarProvider>
              </AuthProvider>
            </QueryProvider>
          </MswProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

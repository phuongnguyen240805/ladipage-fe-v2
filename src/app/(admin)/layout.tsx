import type { ReactNode } from "react";
import { AdminShell } from "./_components/AdminShell.client";
import { AdminProviders } from "./_providers/AdminProviders.client";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminProviders>
      <AdminShell>{children}</AdminShell>
    </AdminProviders>
  );
}

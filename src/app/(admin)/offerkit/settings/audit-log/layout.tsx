/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { redirect } from "next/navigation";
import { getDashboardRole, requireDashboardSession } from "@/features/offerkit/lib/session";

export default async function AuditLogLayout({ children }: { children: React.ReactNode }) {
  const session = await requireDashboardSession();
  if (getDashboardRole(session) !== "admin") redirect("/dashboard");
  return children;
}

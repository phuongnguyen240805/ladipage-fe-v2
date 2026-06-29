/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { cache } from "react";

export type DashboardRole = "admin" | "member";

export interface DashboardSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: DashboardRole;
    mustChangePassword: false;
  };
}

const demoSession: DashboardSession = {
  user: {
    id: "demo-marketing-admin",
    name: "Marketing Admin",
    email: "demo@marketing.local",
    role: "admin",
    mustChangePassword: false,
  },
};

export const getDashboardSession = cache(async () => demoSession);

export async function requireDashboardSession() {
  return getDashboardSession();
}

export function getDashboardRole(session: Awaited<ReturnType<typeof getDashboardSession>>) {
  return session.user.role;
}

export function userMustChangePassword(
  session: Awaited<ReturnType<typeof getDashboardSession>>,
) {
  return session.user.mustChangePassword;
}

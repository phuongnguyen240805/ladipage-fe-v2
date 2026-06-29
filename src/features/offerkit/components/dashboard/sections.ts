/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import type { ComponentType } from "react";
import {
  BarChart3,
  FileText,
  Gift,
  GraduationCap,
  Home,
  Key,
  ListTree,
  Megaphone,
  MessagesSquare,
  Settings,
  ShoppingBag,
  Target,
  TicketPercent,
  UserPlus,
  Users,
  Webhook,
} from "lucide-react";

export interface DashboardSectionItem {
  href: string;
  // `label`, `section`, and `description` are stable English source strings; <T> wraps them at render.
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  /** Render only for users with role=admin. */
  adminOnly?: boolean;
}

export interface DashboardSection {
  label: string;
  items: DashboardSectionItem[];
}

export const dashboardSections: DashboardSection[] = [
  {
    label: "Overview",
    items: [
      {
        href: "/offerkit",
        label: "Overview",
        description: "Start from the main dashboard hub.",
        icon: Home,
      },
    ],
  },
  {
    label: "People",
    items: [
      {
        href: "/offerkit/customers",
        label: "Leads & learners",
        description: "Contacts from Facebook funnels and students in course journeys.",
        icon: Users,
      },
      {
        href: "/offerkit/segments",
        label: "Audience segments",
        description: "Target rules for ads, enrollment cohorts, and nurture campaigns.",
        icon: ListTree,
      },
    ],
  },
  {
    label: "Marketing",
    items: [
      {
        href: "/offerkit/campaigns",
        label: "Facebook campaigns",
        description: "Launch lead magnets, promo offers, and retargeting plays.",
        icon: Megaphone,
      },
      {
        href: "/offerkit/vouchers",
        label: "Offer codes",
        description: "Coupon, trial, and course-access codes for learners.",
        icon: TicketPercent,
      },
      {
        href: "/offerkit/orders",
        label: "Enrollments",
        description: "Purchases, course registrations, and redemption context.",
        icon: ShoppingBag,
      },
      {
        href: "/offerkit/insights",
        label: "Performance insights",
        description: "Ad conversion, enrollment, and revenue signals in one place.",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Learning",
    items: [
      {
        href: "/offerkit/loyalty",
        label: "Learning paths",
        description: "Course tracks, progress rewards, and cohort milestones.",
        icon: GraduationCap,
      },
      {
        href: "/offerkit/referrals",
        label: "Affiliate referrals",
        description: "Partner links, student invites, and commission-style rewards.",
        icon: UserPlus,
      },
    ],
  },
  {
    label: "Automation",
    items: [
      {
        href: "/offerkit/rules",
        label: "Eligibility rules",
        description: "Gate offers by campaign source, course, cohort, or spend.",
        icon: Target,
      },
      {
        href: "/offerkit/rewards",
        label: "Reward library",
        description: "Bonuses, lessons, certificates, and upsell incentives.",
        icon: Gift,
      },
      {
        href: "/offerkit/events",
        label: "Activity stream",
        description: "Lead, enrollment, learning, and redemption events.",
        icon: MessagesSquare,
      },
      {
        href: "/offerkit/webhooks",
        label: "Integrations",
        description: "Send events to CRM, LMS, email, and ad reporting tools.",
        icon: Webhook,
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        href: "/offerkit/settings/api-keys",
        label: "API keys",
        description: "Scoped credentials for marketing and LMS integrations.",
        icon: Key,
      },
      {
        href: "/offerkit/settings/audit-log",
        label: "Audit log",
        description: "Admin-only mutation history across dashboard and API actions.",
        icon: FileText,
        adminOnly: true,
      },
      {
        href: "/offerkit/settings",
        label: "Workspace",
        description: "Brand, currency, timezone, and operating defaults.",
        icon: Settings,
      },
    ],
  },
];

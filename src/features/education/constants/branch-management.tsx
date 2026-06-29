"use client";
import React from "react";
import {
  LayoutGrid as GridIcon,
} from "lucide-react";

export type NavItem = {
  name: string;
  icon?: React.ReactNode;
  path?: string;
  pro?: boolean;
  new?: boolean;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

export const CenterItems: NavItem[] = [];

export const LearingItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Học tập",
    path: "/education/dashboard/branch-management",
  },
];

export const navItems: NavItem[] = [
  {
    name: "Quản lý",
    icon: <GridIcon />,
    path: "/education/dashboard/branch-management",
  },
];

export const othersItems: NavItem[] = [];

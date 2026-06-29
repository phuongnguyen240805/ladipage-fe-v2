"use client";
import React from "react";
import {
  MessageSquare,
} from "lucide-react";

export type NavItem = {
  name: string;
  icon?: React.ReactNode;
  path?: string;
  pro?: boolean;
  new?: boolean;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

export const PARENT_INFO_ITEMS: NavItem[] = [
  {
    icon: <MessageSquare size={20} />,
    name: "Tổng quan",
    path: "/education/dashboard/parents",
  },
];

export const PARENT_STUDY_ITEMS: NavItem[] = [];

"use client";
import { NavItem } from "./navigation";
import {
  Info,
} from "lucide-react";
import React from "react";

export const CONSULTANT_CENTER_ITEMS: NavItem[] = [
  {
    name: "Tổng quan",
    icon: <Info size={20} />,
    path: "/education/dashboard/consultant",
  },
];

export const CONSULTANT_LEARNING_ITEMS: NavItem[] = [];

export const CONSULTANT_MANAGEMENT_ITEMS: NavItem[] = [];

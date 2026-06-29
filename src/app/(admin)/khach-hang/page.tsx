"use client";

import React, { useState } from "react";
import { CustomerItem } from "@/components/customers/dung-chung/types";
import { CustomersSidebar } from "@/components/customers/sidebar/CustomersSidebar";
import { CustomersList } from "@/components/customers/customers/CustomersList";
import { CompanyList } from "@/components/customers/companies/CompanyList";
import { SegmentList } from "@/components/customers/segments/SegmentList";
import { CustomerTags } from "@/components/customers/tags/CustomerTags";
import { CustomerCustomFields } from "@/components/customers/custom-fields/CustomerCustomFields";
import { ErrorLog } from "@/components/customers/error-logs/ErrorLog";

// ─── Initial Customer Seed Data ──────────────────────────────────────────────
const initialCustomers: CustomerItem[] = [
  {
    id: "KH1001",
    name: "Nguyễn Thị Kim Ngân",
    phone: "0987654321",
    email: "ngan.ntk@gmail.com",
    status: "ACTIVE",
    createdAt: "10:20 12/06/2026",
    segment: "New Subscribers",
    tags: ["VIP", "Lead"],
  },
  {
    id: "KH1002",
    name: "Phạm Minh Tuấn",
    phone: "0909123456",
    email: "tuan.pm@gmail.com",
    status: "ACTIVE",
    createdAt: "14:35 12/06/2026",
    segment: "Email Subscribers",
    tags: ["Member"],
  },
  {
    id: "KH1003",
    name: "Trần Văn Cường",
    phone: "0918888999",
    email: "cuong.tv@yahoo.com",
    status: "BLOCKED",
    createdAt: "09:12 13/06/2026",
    segment: "Zalo Subscribers",
    tags: ["Spam"],
  },
  {
    id: "KH1004",
    name: "Lê Thị Thanh Thảo",
    phone: "0933445566",
    email: "thao.ltt@gmail.com",
    status: "ACTIVE",
    createdAt: "11:45 13/06/2026",
    segment: "SMS Subscribers",
    tags: ["Lead"],
  },
];

export default function KhachHangPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>(initialCustomers);
  const [activeSubTab, setActiveSubTab] = useState("customers");

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleAddCustomer = (data: Omit<CustomerItem, "id" | "createdAt">) => {
    const now = new Date();
    const timeStr =
      now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) +
      " " +
      now.toLocaleDateString("vi-VN");

    const newCustomer: CustomerItem = {
      id: "KH" + (1000 + customers.length + 1),
      name: data.name,
      phone: data.phone,
      email: data.email,
      status: data.status,
      createdAt: timeStr,
      segment: data.segment,
      tags: data.tags,
    };

    setCustomers((prev) => [newCustomer, ...prev]);
  };

  const handleDeleteCustomers = (ids: string[]) => {
    setCustomers((prev) => prev.filter((c) => !ids.includes(c.id)));
  };

  const handleUpdateStatus = (ids: string[], status: "ACTIVE" | "BLOCKED") => {
    setCustomers((prev) =>
      prev.map((c) => (ids.includes(c.id) ? { ...c, status } : c))
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-0 -m-4 md:-m-6 h-[calc(100vh-72px)] md:h-[calc(100vh-80px)] overflow-hidden">
      {/* 1. Sub-Sidebar Navigation */}
      <CustomersSidebar
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
      />

      {/* 2. Content view */}
      <div className="flex-1 flex flex-col h-full bg-[#f8fafc] dark:bg-[#0f1016] overflow-y-auto p-6">
        {activeSubTab === "customers" ? (
          <CustomersList
            customers={customers}
            onAddCustomer={handleAddCustomer}
            onDeleteCustomers={handleDeleteCustomers}
            onUpdateStatus={handleUpdateStatus}
          />
        ) : activeSubTab === "companies" ? (
          <CompanyList />
        ) : activeSubTab === "segments" ? (
          <SegmentList />
        ) : activeSubTab === "tags" ? (
          <CustomerTags />
        ) : activeSubTab === "custom-fields" ? (
          <CustomerCustomFields />
        ) : activeSubTab === "error-logs" ? (
          <ErrorLog />
        ) : (
          <CustomersList
            customers={customers}
            onAddCustomer={handleAddCustomer}
            onDeleteCustomers={handleDeleteCustomers}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </div>
    </div>
  );
}

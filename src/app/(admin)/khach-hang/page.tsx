"use client";

import React, { useState } from "react";
import ApiState from "@/components/common/ApiState";
import { CustomerItem } from "@/components/customers/dung-chung/types";
import { CustomersSidebar } from "@/components/customers/sidebar/CustomersSidebar";
import { CustomersList } from "@/components/customers/customers/CustomersList";
import { CompanyList } from "@/components/customers/companies/CompanyList";
import { SegmentList } from "@/components/customers/segments/SegmentList";
import { CustomerTags } from "@/components/customers/tags/CustomerTags";
import { CustomerCustomFields } from "@/components/customers/custom-fields/CustomerCustomFields";
import { ErrorLog } from "@/components/customers/error-logs/ErrorLog";
import {
  useCreateCustomer,
  useCustomers,
  useDeleteCustomers,
  useUpdateCustomerStatus,
} from "@/features/crm/hooks/useCustomers";
import type { CustomerListParams } from "@/lib/endpoints/crm.api";

export default function KhachHangPage() {
  const [activeSubTab, setActiveSubTab] = useState("customers");
  const [customerParams, setCustomerParams] = useState<CustomerListParams>({
    page: 1,
    pageSize: 50,
  });

  const { data, isLoading, error } = useCustomers(customerParams);
  const createCustomer = useCreateCustomer();
  const deleteCustomers = useDeleteCustomers();
  const updateStatus = useUpdateCustomerStatus();
  const customers = data?.items ?? [];

  const handleAddCustomer = async (customerData: {
    name: string;
    phone: string;
    email: string;
    status: CustomerItem["status"];
    segmentIds?: number[];
    tagIds?: number[];
  }) => {
    await createCustomer.mutateAsync({
      name: customerData.name,
      phone: customerData.phone,
      email: customerData.email || undefined,
      status: customerData.status,
      segmentIds: customerData.segmentIds,
      tagIds: customerData.tagIds,
    });
  };

  const handleDeleteCustomers = async (ids: string[]) => {
    await deleteCustomers.mutateAsync(ids);
  };

  const handleUpdateStatus = async (
    ids: string[],
    status: "ACTIVE" | "BLOCKED"
  ) => {
    await updateStatus.mutateAsync({ ids, status });
  };

  const listProps = {
    customers,
    listParams: customerParams,
    onListParamsChange: setCustomerParams,
    onAddCustomer: (data: {
      name: string;
      phone: string;
      email: string;
      status: CustomerItem["status"];
      segmentIds?: number[];
      tagIds?: number[];
    }) => {
      void handleAddCustomer(data);
    },
    onDeleteCustomers: (ids: string[]) => {
      void handleDeleteCustomers(ids);
    },
    onUpdateStatus: (ids: string[], status: "ACTIVE" | "BLOCKED") => {
      void handleUpdateStatus(ids, status);
    },
  };

  const renderContent = () => {
    switch (activeSubTab) {
      case "customers":
        return (
          <ApiState isLoading={isLoading} error={error}>
            <CustomersList {...listProps} />
          </ApiState>
        );
      case "companies":
        return <CompanyList />;
      case "segments":
        return <SegmentList />;
      case "tags":
        return <CustomerTags />;
      case "custom-fields":
        return <CustomerCustomFields />;
      case "error-logs":
        return <ErrorLog />;
      default:
        return (
          <ApiState isLoading={isLoading} error={error}>
            <CustomersList {...listProps} />
          </ApiState>
        );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-0 -m-4 md:-m-6 h-[calc(100vh-72px)] md:h-[calc(100vh-80px)] overflow-hidden">
      <CustomersSidebar
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
      />

      <div className="flex-1 flex flex-col h-full bg-[#f8fafc] dark:bg-[#0f1016] overflow-y-auto p-6">
        {renderContent()}
      </div>
    </div>
  );
}
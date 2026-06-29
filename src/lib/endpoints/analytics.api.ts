import type {
  BusinessReportDto,
  CustomersReportDto,
  ReportChartDto,
  SalesReportDto,
} from "@liora/api-types";
import { apiGet } from "../api-client";

export interface ReportDateRange {
  from: string;
  to: string;
}

export const analyticsApi = {
  getSalesReport(range: ReportDateRange): Promise<SalesReportDto> {
    return apiGet<SalesReportDto>("/analytics/reports/sales", {
      params: range,
    });
  },

  getBusinessReport(range: ReportDateRange): Promise<BusinessReportDto> {
    return apiGet<BusinessReportDto>("/analytics/reports/business", {
      params: range,
    });
  },

  getCustomersReport(range: ReportDateRange): Promise<CustomersReportDto> {
    return apiGet<CustomersReportDto>("/analytics/reports/customers", {
      params: range,
    });
  },

  getJobsReport(range: ReportDateRange): Promise<{ tasks: ReportChartDto }> {
    return apiGet<{ tasks: ReportChartDto }>("/analytics/reports/jobs", {
      params: range,
    });
  },

  getAutomationReport(range: ReportDateRange): Promise<{
    newCustomers: ReportChartDto;
    sentSpend: ReportChartDto;
  }> {
    return apiGet<{ newCustomers: ReportChartDto; sentSpend: ReportChartDto }>(
      "/analytics/reports/automation",
      { params: range }
    );
  },
};
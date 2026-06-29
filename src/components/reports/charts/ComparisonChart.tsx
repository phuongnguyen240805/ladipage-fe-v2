"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ComparisonChartProps {
  title: string;
  categories: string[];
  currentPeriodLabel: string;
  previousPeriodLabel: string;
  currentPeriodData: number[];
  previousPeriodData: number[];
  valueType?: "currency" | "number";
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  title,
  categories,
  currentPeriodLabel,
  previousPeriodLabel,
  currentPeriodData,
  previousPeriodData,
  valueType = "number",
}) => {
  const options: ApexOptions = {
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontFamily: "Outfit, sans-serif",
      fontSize: "11px",
      markers: {
        shape: "circle",
        size: 5,
      },
      itemMargin: {
        horizontal: 8,
        vertical: 0,
      },
    },
    colors: ["#65a30d", "#95b3ff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: [2, 2],
      dashArray: [0, 5], // Dashed line for the previous period comparison
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.25,
        opacityTo: 0,
        stops: [0, 95, 100],
      },
    },
    markers: {
      size: 4,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val) => {
          if (valueType === "currency") {
            return val.toLocaleString("vi-VN") + " đ";
          }
          return val.toLocaleString("vi-VN") + " đơn";
        },
      },
    },
    xaxis: {
      type: "category",
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          fontSize: "11px",
          colors: "#64748b",
          fontWeight: 500,
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "11px",
          colors: "#64748b",
          fontWeight: 500,
        },
        formatter: (val) => {
          if (valueType === "currency") {
            if (val >= 1000000) {
              return (val / 1000000).toFixed(0) + "tr";
            }
            if (val >= 1000) {
              return (val / 1000).toFixed(0) + "k";
            }
            return val + "đ";
          }
          return val.toString();
        },
      },
    },
  };

  const series = [
    {
      name: currentPeriodLabel,
      data: currentPeriodData,
    },
    {
      name: previousPeriodLabel,
      data: previousPeriodData,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-theme-xs">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white/90">
          {title}
        </h3>
      </div>
      <div className="max-w-full overflow-x-auto no-scrollbar">
        <ReactApexChart options={options} series={series} type="area" height={280} />
      </div>
    </div>
  );
};

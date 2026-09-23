"use client";

import { useScopedFilters } from "@/shared/hooks/useScopedFilters";
import ProductivityDashboard from "./ProductivityDashboard";
import ProductivityHistoricalDashboard from "./ProductivityHistoricalDashboard";
import { PRODUCTIVITY_DASHBOARD } from "../lib/productivityDashboard.constants";

type DashboardMode = "monthly" | "historical";

export default function ProductivityDashboardContainer() {
  const { values: filtersState, setFieldValue: setFilter } = useScopedFilters(
    PRODUCTIVITY_DASHBOARD.ABSOLUTE_ROUTE,
    {
      dashboardMode: "monthly" as DashboardMode,
    },
  );
  const { dashboardMode } = filtersState;
  const setDashboardMode = (value: DashboardMode) =>
    setFilter("dashboardMode", value);

  return dashboardMode === "monthly" ? (
    <ProductivityDashboard
      dashboardMode={dashboardMode}
      onDashboardModeChange={setDashboardMode}
    />
  ) : (
    <ProductivityHistoricalDashboard
      dashboardMode={dashboardMode}
      onDashboardModeChange={setDashboardMode}
    />
  );
}

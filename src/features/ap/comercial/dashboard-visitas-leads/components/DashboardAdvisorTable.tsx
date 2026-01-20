"use client";

import { useMemo } from "react";
import { IndicatorByAdvisor } from "../lib/dashboard.interface";
import { DataTable } from "@/shared/components/DataTable";
import { dashboardAdvisorColumns } from "./DashboardAdvisorColumns";

interface DashboardAdvisorTableProps {
  data: IndicatorByAdvisor[];
  selectedSedeId?: number | null;
}

export default function DashboardAdvisorTable({
  data,
  selectedSedeId,
}: DashboardAdvisorTableProps) {
  const sortedData = useMemo(
    () => [...data].sort((a, b) => b.total_visitas - a.total_visitas),
    [data],
  );

  const columns = useMemo(
    () => dashboardAdvisorColumns({ selectedSedeId }),
    [selectedSedeId],
  );

  return (
    <DataTable
      columns={columns}
      data={sortedData}
      variant="simple"
      isVisibleColumnFilter={false}
    />
  );
}

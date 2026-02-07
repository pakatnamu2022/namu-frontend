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
    () =>
      [...data].sort((a, b) => a.worker_nombre.localeCompare(b.worker_nombre)),
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

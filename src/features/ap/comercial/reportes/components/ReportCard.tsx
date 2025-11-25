"use client";

import { ReportConfig, ReportFilterValues } from "../lib/reports.interface";
import { ReportFilters } from "./ReportFilters";
import { useDownloadReport } from "../lib/reports.hook";
import { FileBarChart } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface ReportCardProps {
  report: ReportConfig;
}

export function ReportCard({ report }: ReportCardProps) {
  const { mutate: downloadReport, isPending } = useDownloadReport();

  const handleDownload = (values: ReportFilterValues) => {
    // Combinar valores del formulario con parámetros por defecto
    const params = {
      ...report.defaultParams,
      ...values,
    };

    downloadReport({
      endpoint: report.endpoint,
      params,
    });
  };

  // Obtener el ícono dinámicamente
  const IconComponent = report.icon
    ? (LucideIcons as any)[report.icon] || FileBarChart
    : FileBarChart;

  return (
    <div className="w-full border rounded-lg p-6 space-y-5 bg-card">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-md bg-primary/10">
          <IconComponent className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-medium">{report.title}</h3>
      </div>
      <ReportFilters
        fields={report.fields}
        onSubmit={handleDownload}
        isLoading={isPending}
      />
    </div>
  );
}

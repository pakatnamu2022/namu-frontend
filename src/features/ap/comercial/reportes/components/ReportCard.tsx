"use client";

import { useState } from "react";
import { ReportConfig, ReportFilterValues } from "../lib/reports.interface";
import { ReportFilters } from "./ReportFilters";
import { useDownloadReport } from "../lib/reports.hook";
import { FileBarChart } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import GeneralSheet from "@/shared/components/GeneralSheet";

interface ReportCardProps {
  report: ReportConfig;
}

export function ReportCard({ report }: ReportCardProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { mutate: downloadReport, isPending } = useDownloadReport();

  const handleDownload = (values: ReportFilterValues) => {
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
    <>
      <div className="w-full border rounded-lg p-4 bg-card flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-primary/10 shrink-0">
            <IconComponent className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium leading-tight">{report.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {report.description}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setIsSheetOpen(true)}
        >
          Configurar
        </Button>
      </div>

      <GeneralSheet
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title={report.title}
        subtitle={report.description}
        icon={report.icon as keyof typeof LucideIcons}
        size="md"
      >
        <ReportFilters
          fields={report.fields}
          onSubmit={handleDownload}
          isLoading={isPending}
        />
      </GeneralSheet>
    </>
  );
}

"use client";

import { ReportConfig } from "@/shared/lib/reports/reports.interface";
import { ReportCard } from "./ReportCard";
import { FileBarChart } from "lucide-react";

interface ReportsGridProps {
  reports: ReportConfig[];
  emptyMessage?: string;
}

export function ReportsGrid({
  reports,
  emptyMessage = "Los reportes se agregarán próximamente",
}: ReportsGridProps) {
  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <FileBarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          No hay reportes disponibles
        </h3>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  const hasSections = reports.some((report) => report.section);

  if (!hasSections) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>
    );
  }

  const sections = new Map<string, ReportConfig[]>();
  reports.forEach((report) => {
    const key = report.section ?? "";
    if (!sections.has(key)) sections.set(key, []);
    sections.get(key)!.push(report);
  });

  return (
    <div className="space-y-8">
      {Array.from(sections.entries()).map(([section, sectionReports]) => (
        <div key={section || "sin-seccion"}>
          {section && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                {section}
              </h3>
              <div className="mt-2 border-b border-border" />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sectionReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

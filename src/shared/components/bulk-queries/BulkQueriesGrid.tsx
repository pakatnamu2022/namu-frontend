"use client";

import { BulkQueryConfig } from "@/shared/lib/bulk-queries/bulkQueries.interface";
import { BulkQueryCard } from "./BulkQueryCard";
import { FileSearch } from "lucide-react";

interface BulkQueriesGridProps {
  queries: BulkQueryConfig[];
  emptyMessage?: string;
}

export function BulkQueriesGrid({
  queries,
  emptyMessage = "Las consultas masivas se agregarán próximamente",
}: BulkQueriesGridProps) {
  if (queries.length === 0) {
    return (
      <div className="text-center py-12">
        <FileSearch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          No hay consultas masivas disponibles
        </h3>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  const hasSections = queries.some((query) => query.section);

  if (!hasSections) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {queries.map((query) => (
          <BulkQueryCard key={query.id} query={query} />
        ))}
      </div>
    );
  }

  const sections = new Map<string, BulkQueryConfig[]>();
  queries.forEach((query) => {
    const key = query.section ?? "";
    if (!sections.has(key)) sections.set(key, []);
    sections.get(key)!.push(query);
  });

  return (
    <div className="space-y-8">
      {Array.from(sections.entries()).map(([section, sectionQueries]) => (
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
            {sectionQueries.map((query) => (
              <BulkQueryCard key={query.id} query={query} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

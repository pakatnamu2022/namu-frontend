"use client";

import { Target } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export default function EmptyState({
  title = "No se encontraron objetivos",
  description = "No hay objetivos asignados para esta evaluación.",
  icon: Icon = Target,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 border rounded-lg">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Icon className="size-12" />
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
}

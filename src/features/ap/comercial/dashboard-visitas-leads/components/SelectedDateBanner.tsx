"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";

interface SelectedDateBannerProps {
  date: Date | null;
}

export default function SelectedDateBanner({ date }: SelectedDateBannerProps) {
  return (
    <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
      <p className="text-sm text-muted-foreground">Mostrando datos de:</p>
      <p className="text-lg font-bold text-primary">
        {date ? format(date, "PPP", { locale: es }) : "Selecciona una fecha"}
      </p>
    </div>
  );
}

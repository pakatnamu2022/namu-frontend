"use client";

import { useState } from "react";
import { UserX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { errorToast, successToast } from "@/core/core.function";
import { reportAbsent } from "@/features/gp/gestionhumana/asistencias/lib/attendance.actions";

interface Props {
  date?: string;
}

export default function AttendanceAbsentReportButton({ date }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const result = await reportAbsent(date);
      successToast(result.message ?? "Reporte de ausentes generado");
    } catch (err: any) {
      errorToast(err?.response?.data?.message ?? "Error al generar el reporte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="sm" variant="outline" onClick={handleClick} disabled={loading}>
      {loading ? (
        <Loader2 className="size-4 mr-1.5 animate-spin" />
      ) : (
        <UserX className="size-4 mr-1.5" />
      )}
      {loading ? "Generando…" : "Reporte ausentes"}
    </Button>
  );
}

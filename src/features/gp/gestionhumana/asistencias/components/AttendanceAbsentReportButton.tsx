"use client";

import { useState } from "react";
import { UserX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
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
    <ConfirmationDialog
      trigger={
        <Button size="sm" variant="outline" disabled={loading}>
          {loading ? (
            <Loader2 className="size-4 mr-1.5 animate-spin" />
          ) : (
            <UserX className="size-4 mr-1.5" />
          )}
          {loading ? "Generando…" : "Reporte ausentes"}
        </Button>
      }
      title="¿Generar reporte de ausentes?"
      description="Se generará el reporte de colaboradores ausentes para la fecha seleccionada."
      confirmText="Sí, generar"
      cancelText="Cancelar"
      icon="info"
      onConfirm={handleClick}
    />
  );
}

"use client";

import { GeneralModal } from "@/shared/components/GeneralModal";
import { Badge } from "@/components/ui/badge";
import { Loader2, History } from "lucide-react";
import {
  useRecruitmentProcessCoverage,
  useRecruitmentProcessHistory,
} from "../lib/recruitmentProcess.hook.ts";
import { RecruitmentProcessResource } from "../lib/recruitmentProcess.interface.ts";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  process: RecruitmentProcessResource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProcessHistoryDialog({
  process,
  open,
  onOpenChange,
}: Props) {
  const id = process?.id ?? null;
  const { data: coverage, isLoading: isLoadingCoverage } =
    useRecruitmentProcessCoverage(open ? id : null);
  const { data: history, isLoading: isLoadingHistory } =
    useRecruitmentProcessHistory(open ? id : null);

  return (
    <GeneralModal
      open={open}
      onClose={() => onOpenChange(false)}
      title="Historial y cobertura del proceso"
      subtitle={process?.nombre_postulacion}
      icon="History"
      size="2xl"
    >
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-2">Indicador de cobertura</h4>
          {isLoadingCoverage ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Cargando...
            </div>
          ) : coverage ? (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div className="border rounded-md p-2">
                <p className="text-[11px] text-muted-foreground">Plazo</p>
                <p className="font-semibold">{coverage.dias_plazo} días</p>
              </div>
              <div className="border rounded-md p-2">
                <p className="text-[11px] text-muted-foreground">
                  Gestión real
                </p>
                <p className="font-semibold">{coverage.dias_gestion} días</p>
              </div>
              <div className="border rounded-md p-2">
                <p className="text-[11px] text-muted-foreground">Pausados</p>
                <p className="font-semibold">{coverage.dias_pausados} días</p>
              </div>
              <div className="border rounded-md p-2">
                <p className="text-[11px] text-muted-foreground">
                  Veces pausado
                </p>
                <p className="font-semibold">{process?.veces_pausado ?? 0}</p>
              </div>
              <div className="border rounded-md p-2 flex flex-col justify-center items-start">
                <Badge color={coverage.dentro_de_plazo ? "green" : "red"}>
                  {coverage.dentro_de_plazo
                    ? "Dentro de plazo"
                    : "Fuera de plazo"}
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin datos.</p>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2">Trazabilidad</h4>
          {isLoadingHistory ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Cargando...
            </div>
          ) : history && history.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {history.map((entry) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="mt-0.5">
                    <History className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium uppercase">
                        {entry.accion}
                      </span>
                      {entry.dias_agregados ? (
                        <Badge variant="outline">
                          +{entry.dias_agregados} días
                        </Badge>
                      ) : null}
                    </div>
                    {entry.detalle && (
                      <p className="text-xs text-muted-foreground">
                        {entry.detalle}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground">
                      {entry.usuario ?? "Sistema"} ·{" "}
                      {format(entry.created_at, "PPP HH:mm", { locale: es })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Sin movimientos registrados.
            </p>
          )}
        </div>
      </div>
    </GeneralModal>
  );
}

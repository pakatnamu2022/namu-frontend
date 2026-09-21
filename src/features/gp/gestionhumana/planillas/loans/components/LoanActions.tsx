"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LOAN } from "../lib/loan.constant";
import { syncLegacyLoans } from "../lib/loan.actions";
import { errorToast, successToast, warningToast } from "@/core/core.function";

const { MODEL, ROUTE_ADD, QUERY_KEY } = LOAN;

export default function LoanActions() {
  const push = useNavigate();
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncLegacyLoans();
      const summary =
        `${result.created} nuevo(s), ${result.updated} actualizado(s), ` +
        `${result.deleted} eliminado(s), ${result.details_imported} pago(s) importado(s).`;

      if (result.skipped_total > 0) {
        const extra = result.skipped_total - result.skipped.length;
        warningToast(
          `Sincronización con ${result.skipped_total} observación(es)`,
          `${summary} ${result.skipped.join("; ")}${extra > 0 ? `; y ${extra} más` : ""}`,
        );
      } else {
        successToast("Préstamos sincronizados con el sistema anterior", summary);
      }
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ??
          error?.response?.data?.error ??
          "No se pudieron sincronizar los préstamos.",
      );
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2 w-full md:w-auto md:ml-auto">
      <Button
        size="sm"
        variant="outline"
        className="w-full md:w-auto"
        onClick={handleSync}
        disabled={isSyncing}
        title="Trae los préstamos y cuotas registrados en el sistema anterior (web_millagp_2). Se puede repetir sin duplicar."
      >
        {isSyncing ? (
          <Loader2 className="size-4 mr-2 animate-spin" />
        ) : (
          <RefreshCw className="size-4 mr-2" />
        )}
        Sincronizar sistema anterior
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="w-full md:w-auto"
        onClick={() => push(ROUTE_ADD)}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
    </div>
  );
}

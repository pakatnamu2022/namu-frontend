"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { errorToast, formatDate, successToast } from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { addLifePolicyWorker } from "../lib/life-policy.actions";
import { useLifePolicy } from "../lib/life-policy.hook";
import { LIFE_POLICY } from "../lib/life-policy.constants";
import { money } from "./LifePolicyColumns";

const { QUERY_KEY } = LIFE_POLICY;

interface Props {
  policyId: number;
  onClose: () => void;
}

export default function LifePolicyDetailModal({ policyId, onClose }: Props) {
  const queryClient = useQueryClient();
  const { data: policy, isLoading } = useLifePolicy(policyId);
  const { data: workers } = useAllWorkers({ status_id: 22 }, true);
  const [workerId, setWorkerId] = useState("");
  const [salary, setSalary] = useState("");

  const insuredIds = new Set((policy?.workers ?? []).map((w) => w.worker_id));
  const workerOptions = (workers ?? [])
    .filter((w) => !insuredIds.has(w.id))
    .map((w) => ({ value: String(w.id), label: w.name }));

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      addLifePolicyWorker(policyId, {
        worker_id: Number(workerId),
        insured_salary: salary ? Number(salary) : undefined,
      }),
    onSuccess: async () => {
      successToast("Trabajador incluido en la póliza");
      setWorkerId("");
      setSalary("");
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message,
        "No se pudo incluir al trabajador",
      );
    },
  });

  return (
    <GeneralModal
      open
      onClose={onClose}
      title="Trabajadores asegurados"
      icon="User2"
      subtitle={
        policy
          ? `${policy.insurer ?? "Póliza"} ${policy.policy_number ?? ""} · ${formatDate(policy.start_date)} al ${formatDate(policy.end_date)}`
          : undefined
      }
      size="5xl"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-6 rounded-md border p-3">
          <div className="w-auto">
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Incluir trabajador (ingreso posterior a la póliza)
            </p>
            <SearchableSelect
              options={workerOptions}
              value={workerId}
              onChange={setWorkerId}
              placeholder="Selecciona un trabajador"
            />
          </div>
          <div className="w-auto">
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Sueldo asegurado (opcional)
            </p>
            <Input
              className="h-7 text-sm"
              placeholder="Vacío = sueldo actual"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            disabled={!workerId || isPending}
            onClick={() => mutate()}
          >
            {isPending ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="mr-2 h-4 w-4" />
            )}
            Incluir
          </Button>
        </div>

        <div className="max-h-[50vh] overflow-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted text-left text-xs">
              <tr>
                <th className="p-2">DNI</th>
                <th className="p-2">Trabajador</th>
                <th className="p-2 text-right">Sueldo asegurado</th>
                <th className="p-2 text-right">Costo neto</th>
                <th className="p-2 text-right">Total con IGV</th>
                <th className="p-2 text-right">Monto mensual</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="p-4 text-center">
                    Cargando...
                  </td>
                </tr>
              )}
              {(policy?.workers ?? []).map((w) => (
                <tr key={w.id} className="border-t">
                  <td className="p-2">{w.vat ?? "—"}</td>
                  <td className="p-2 font-medium">
                    {w.nombre_completo ?? "—"}
                  </td>
                  <td className="p-2 text-right">{money(w.insured_salary)}</td>
                  <td className="p-2 text-right">{money(w.net_cost)}</td>
                  <td className="p-2 text-right">{money(w.total_with_igv)}</td>
                  <td className="p-2 text-right font-semibold">
                    {money(w.monthly_amount)}
                  </td>
                </tr>
              ))}
              {!isLoading && (policy?.workers ?? []).length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-4 text-center text-muted-foreground"
                  >
                    Sin trabajadores asegurados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </GeneralModal>
  );
}

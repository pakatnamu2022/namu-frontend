"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Lock, LockOpen, Plus, X, Save, Loader2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { errorToast, successToast } from "@/core/core.function";
import { useAttendanceRuleCodes } from "../lib/attendance-rule.hook";
import {
  useWorkerAttendanceRules,
  WORKER_ATTENDANCE_RULES_QUERY_KEY,
} from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker-attendance-rules.hook.ts";
import { syncWorkerAttendanceRules } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker-attendance-rules.actions.ts";
import { useWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { WorkerResource } from "../../../gestion-de-personal/trabajadores/lib/worker.interface";

interface WorkerAttendanceRulesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkerAttendanceRulesModal({
  open,
  onOpenChange,
}: WorkerAttendanceRulesModalProps) {
  const queryClient = useQueryClient();
  const { data: allCodes = [] } = useAttendanceRuleCodes();

  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
  const [selectedWorkerName, setSelectedWorkerName] = useState<string>("");
  const [pendingCodes, setPendingCodes] = useState<string[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data: rulesData, isLoading: isLoadingRules } =
    useWorkerAttendanceRules(selectedWorkerId);

  const form = useForm({ defaultValues: { worker_id: "" } });

  // Solo usamos los códigos del servidor si hay restricción activa
  const serverCodes: string[] = rulesData?.has_restriction
    ? [...new Set(rulesData.rules.map((r) => r.code))]
    : [];

  const currentCodes: string[] = pendingCodes ?? serverCodes;

  const hasRestriction =
    pendingCodes !== null
      ? pendingCodes.length > 0
      : (rulesData?.has_restriction ?? false);

  // Deduplicar allCodes por código y excluir los ya asignados
  const uniqueAllCodes = allCodes.filter(
    (c, idx, arr) => arr.findIndex((x) => x.code === c.code) === idx,
  );
  const availableCodes = uniqueAllCodes.filter(
    (c) => !currentCodes.includes(c.code),
  );

  const handleWorkerChange = (value: string, label?: string) => {
    const id = value ? Number(value) : null;
    setSelectedWorkerId(id);
    setSelectedWorkerName(label ?? "");
    setPendingCodes(null);
  };

  const handleAddCode = (code: string) => {
    const base = pendingCodes ?? serverCodes;
    setPendingCodes([...base, code]);
  };

  const handleRemoveCode = (code: string) => {
    const base = pendingCodes ?? serverCodes;
    setPendingCodes(base.filter((c) => c !== code));
  };

  const handleSave = async () => {
    if (!selectedWorkerId || pendingCodes === null) return;
    setIsSaving(true);
    try {
      await syncWorkerAttendanceRules(selectedWorkerId, pendingCodes);
      await queryClient.invalidateQueries({
        queryKey: [WORKER_ATTENDANCE_RULES_QUERY_KEY, selectedWorkerId],
      });
      setPendingCodes(null);
      successToast("Restricciones actualizadas correctamente");
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "Error al guardar las restricciones",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedWorkerId(null);
    setSelectedWorkerName("");
    setPendingCodes(null);
    form.reset();
    onOpenChange(false);
  };

  const isDirty = pendingCodes !== null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Restricciones de Asistencia por Persona
          </DialogTitle>
          <DialogDescription>
            Selecciona un trabajador y define qué códigos de asistencia puede
            usar. Si no asignas ninguno, podrá usar todos los códigos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Worker selector */}
          <Form {...form}>
            <FormSelectAsync
              control={form.control}
              name="worker_id"
              label="Trabajador"
              placeholder="Buscar trabajador..."
              useQueryHook={useWorkers}
              mapOptionFn={(worker: WorkerResource) => ({
                value: worker.id.toString(),
                label: worker.name,
                description:
                  worker.document +
                  " | " +
                  worker.sede +
                  " | " +
                  worker.position,
              })}
              perPage={10}
              debounceMs={400}
              onValueChange={(value, option) =>
                handleWorkerChange(value, option?.label)
              }
            />
          </Form>

          {/* Rules panel — only shown once a worker is selected */}
          {selectedWorkerId && (
            <div className="border rounded-lg p-4 space-y-3">
              {selectedWorkerName && (
                <p className="text-sm font-medium truncate">{selectedWorkerName}</p>
              )}
              {isLoadingRules ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando reglas...
                </div>
              ) : (
                <>
                  {/* Status */}
                  <div className="flex items-center gap-1.5 text-sm">
                    {hasRestriction ? (
                      <>
                        <Lock className="h-3.5 w-3.5 text-amber-600" />
                        <span className="font-medium text-amber-700">
                          Con restricción
                        </span>
                        <span className="text-muted-foreground">
                          — solo los códigos listados abajo
                        </span>
                      </>
                    ) : (
                      <>
                        <LockOpen className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="font-medium text-emerald-700">
                          Sin restricción
                        </span>
                        <span className="text-muted-foreground">
                          — puede usar todos los códigos
                        </span>
                      </>
                    )}
                  </div>

                  {/* Assigned code chips */}
                  {currentCodes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {currentCodes.map((code) => {
                        const ruleData = rulesData?.rules.find(
                          (r) => r.code === code,
                        );
                        const codeData = allCodes.find((c) => c.code === code);
                        const description =
                          ruleData?.description ??
                          codeData?.description ??
                          null;
                        return (
                          <Badge
                            key={code}
                            className="pl-2.5 pr-1 py-1 gap-1.5 font-semibold"
                          >
                            {code}
                            {description && (
                              <span className="font-normal text-xs opacity-70">
                                {description}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveCode(code)}
                              className="ml-0.5 rounded-full hover:bg-destructive/20 p-0.5 transition-colors"
                              title={`Quitar ${code}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  {/* Add code */}
                  {availableCodes.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Select onValueChange={handleAddCode}>
                        <SelectTrigger className="w-[200px] h-8 text-sm">
                          <SelectValue placeholder="Agregar código..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCodes.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              <span className="font-semibold">{c.code}</span>
                              {c.description && (
                                <span className="ml-2 text-muted-foreground text-xs">
                                  {c.description}
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Plus className="h-3 w-3" />
                        Agregar código
                      </span>
                    </div>
                  )}

                  {/* Save */}
                  {isDirty && (
                    <div className="flex items-center gap-2 pt-1 border-t">
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-3.5 w-3.5" />
                        )}
                        Guardar cambios
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPendingCodes(null)}
                        disabled={isSaving}
                      >
                        Descartar
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

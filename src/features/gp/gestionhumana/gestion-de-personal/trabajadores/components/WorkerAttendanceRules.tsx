"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Lock, LockOpen, Plus, X, Save, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { errorToast, successToast } from "@/core/core.function";
import { useAttendanceRuleCodes } from "@/features/gp/gestionhumana/planillas/reglas-asistencia/lib/attendance-rule.hook";
import {
  useWorkerAttendanceRules,
  WORKER_ATTENDANCE_RULES_QUERY_KEY,
} from "../lib/worker-attendance-rules.hook.ts";
import { syncWorkerAttendanceRules } from "../lib/worker-attendance-rules.actions.ts";

interface WorkerAttendanceRulesProps {
  workerId: number;
}

export function WorkerAttendanceRules({
  workerId,
}: WorkerAttendanceRulesProps) {
  const queryClient = useQueryClient();
  const { data: rulesData, isLoading } = useWorkerAttendanceRules(workerId);
  const { data: allCodes = [] } = useAttendanceRuleCodes();

  const [pendingCodes, setPendingCodes] = useState<string[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const currentCodes =
    pendingCodes ?? rulesData?.rules.map((r) => r.code) ?? [];
  const hasRestriction =
    pendingCodes !== null
      ? pendingCodes.length > 0
      : (rulesData?.has_restriction ?? false);

  const availableCodes = allCodes.filter((c) => !currentCodes.includes(c.code));

  const handleAddCode = (code: string) => {
    const base = pendingCodes ?? rulesData?.rules.map((r) => r.code) ?? [];
    setPendingCodes([...base, code]);
  };

  const handleRemoveCode = (code: string) => {
    const base = pendingCodes ?? rulesData?.rules.map((r) => r.code) ?? [];
    setPendingCodes(base.filter((c) => c !== code));
  };

  const handleSave = async () => {
    if (pendingCodes === null) return;
    setIsSaving(true);
    try {
      await syncWorkerAttendanceRules(workerId, pendingCodes);
      await queryClient.invalidateQueries({
        queryKey: [WORKER_ATTENDANCE_RULES_QUERY_KEY, workerId],
      });
      setPendingCodes(null);
      successToast("Reglas de asistencia actualizadas correctamente");
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "Error al guardar las reglas",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setPendingCodes(null);
  };

  const isDirty = pendingCodes !== null;

  if (isLoading) {
    return (
      <GroupFormSection
        title="Reglas de Asistencia Permitidas"
        icon={Lock}
        color="amber"
        cols={{ sm: 1 }}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando...
        </div>
      </GroupFormSection>
    );
  }

  return (
    <GroupFormSection
      title="Reglas de Asistencia Permitidas"
      icon={Lock}
      color="amber"
      cols={{ sm: 1 }}
    >
      <div className="space-y-3">
        {/* Status indicator */}
        <div className="flex items-center gap-2">
          {hasRestriction ? (
            <div className="flex items-center gap-1.5 text-sm text-amber-700">
              <Lock className="h-3.5 w-3.5" />
              <span className="font-medium">Con restricción</span>
              <span className="text-muted-foreground">
                — solo puede usar los códigos listados abajo
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-sm text-emerald-700">
              <LockOpen className="h-3.5 w-3.5" />
              <span className="font-medium">Sin restricción</span>
              <span className="text-muted-foreground">
                — puede usar cualquier código de asistencia
              </span>
            </div>
          )}
        </div>

        {/* Chips of assigned codes */}
        {currentCodes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {currentCodes.map((code) => {
              const ruleData = rulesData?.rules.find((r) => r.code === code);
              const codeData = allCodes.find((c) => c.code === code);
              const description =
                ruleData?.description ?? codeData?.description ?? null;
              return (
                <Badge
                  key={code}
                  className="pl-2.5 pr-1 py-1 gap-1.5 text-sm font-semibold"
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

        {/* Add code selector */}
        {availableCodes.length > 0 && (
          <div className="flex items-center gap-2">
            <Select onValueChange={handleAddCode}>
              <SelectTrigger className="w-[220px] h-8 text-sm">
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
              Selecciona un código para agregarlo
            </span>
          </div>
        )}

        {/* Save / Cancel */}
        {isDirty && (
          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
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
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancelar
            </Button>
          </div>
        )}
      </div>
    </GroupFormSection>
  );
}

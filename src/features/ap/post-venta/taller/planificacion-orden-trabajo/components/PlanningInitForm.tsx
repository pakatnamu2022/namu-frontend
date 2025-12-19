"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { POSITION_TYPE, STATUS_WORKER } from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant";
import { EMPRESA_AP } from "@/core/core.constants";
import { useForm } from "react-hook-form";

interface PlanningInitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: (hours: number, workerId?: number) => void;
}

export function PlanningInitForm({ open, onOpenChange, onContinue }: PlanningInitFormProps) {
  const [hours, setHours] = useState("2");
  const [workerId, setWorkerId] = useState<string>("");

  const { data: workers = [], isLoading: isLoadingWorkers } = useAllWorkers({
    cargo_id: POSITION_TYPE.OPERATORS,
    status_id: STATUS_WORKER.ACTIVE,
    sede$empresa_id: EMPRESA_AP.id,
  });

  const form = useForm();

  const handleContinue = () => {
    const numHours = Number(hours);
    if (numHours > 0) {
      onContinue(numHours, workerId ? Number(workerId) : undefined);
      setHours("2");
      setWorkerId("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva Planificación</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="hours">Horas Estimadas</Label>
            <Input
              id="hours"
              type="number"
              min="0.5"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="Ej: 2"
            />
            <p className="text-xs text-muted-foreground">
              Tiempo estimado que tomará la tarea
            </p>
          </div>

          <div className="space-y-2">
            <Label>Operario (Opcional)</Label>
            <FormSelect
              name="worker_id"
              placeholder="Todos los operarios"
              options={workers.map((item) => ({
                label: item.name,
                value: item.id.toString(),
              }))}
              control={form.control}
              strictFilter={true}
              disabled={isLoadingWorkers}
              value={workerId}
              onChange={(value) => setWorkerId(value as string)}
            />
            <p className="text-xs text-muted-foreground">
              Si seleccionas un operario, solo verás su línea de tiempo
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleContinue} disabled={!hours || Number(hours) <= 0}>
              Continuar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

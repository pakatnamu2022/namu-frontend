"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { useEquipmentHistory } from "../lib/equipment.hook";
import { unassignEquipment } from "../lib/equipment.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Loader2, User, UserMinus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { errorToast, successToast } from "@/core/core.function";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EquipmentHistorySheetProps {
  open: boolean;
  equipmentId: number | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

export default function EquipmentHistorySheet({
  open,
  equipmentId,
  onClose,
  onSuccess,
}: EquipmentHistorySheetProps) {
  const queryClient = useQueryClient();
  const { data, isFetching, refetch } = useEquipmentHistory(
    open ? equipmentId : null,
  );

  const [unassignDialog, setUnassignDialog] = useState<{
    open: boolean;
    assignmentId: number | null;
  }>({ open: false, assignmentId: null });
  const [unassignObservation, setUnassignObservation] = useState("");
  const [unassignDate, setUnassignDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const { mutate: unassign, isPending: isUnassigning } = useMutation({
    mutationFn: () =>
      unassignEquipment(unassignDialog.assignmentId!, {
        observacion_unassign: unassignObservation,
        fecha: new Date(unassignDate).toISOString(),
      }),
    onSuccess: () => {
      successToast("Equipo desasignado correctamente.");
      setUnassignDialog({ open: false, assignmentId: null });
      setUnassignObservation("");
      refetch();
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      onSuccess?.();
    },
    onError: () => {
      errorToast("Error al desasignar el equipo.");
    },
  });

  const handleUnassignClick = (assignmentId: number) => {
    setUnassignDialog({ open: true, assignmentId });
  };

  const handleUnassignConfirm = () => {
    unassign();
  };

  return (
    <>
      <GeneralSheet
        open={open}
        onClose={onClose}
        icon="History"
        title="Historial de Asignaciones"
        subtitle="Registro de todas las asignaciones realizadas a este equipo"
        size="xl"
      >
        {isFetching ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            No hay asignaciones registradas.
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-3">
              {data.map((item) => {
                const isActive = !item.unassigned_at;
                return (
                  <div
                    key={item.id}
                    className="rounded-lg border bg-card p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-muted-foreground" />
                        <span className="font-semibold text-sm">
                          {item.worker_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          color={isActive ? "green" : "red"}
                          variant="outline"
                        >
                          {isActive ? "Activo" : "Desasignado"}
                        </Badge>
                        {isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => handleUnassignClick(item.id)}
                          >
                            <UserMinus className="size-4 mr-1" />
                            Desasignar
                          </Button>
                        )}
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="size-3.5 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Asignado
                          </p>
                          <p className="font-medium">
                            {formatDate(item.fecha)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="size-3.5 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Desasignado
                          </p>
                          <p className="font-medium">
                            {item.unassigned_at
                              ? formatDate(item.unassigned_at)
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                    {item.observacion && (
                      <div className="text-sm">
                        <p className="text-muted-foreground text-xs">
                          Observación
                        </p>
                        <p className="font-medium">{item.observacion}</p>
                      </div>
                    )}
                    {item.observacion_unassign && (
                      <div className="text-sm">
                        <p className="text-muted-foreground text-xs">
                          Observación de desasignación
                        </p>
                        <p className="font-medium">
                          {item.observacion_unassign}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </GeneralSheet>

      <Dialog
        open={unassignDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setUnassignDialog({ open: false, assignmentId: null });
            setUnassignObservation("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desasignar equipo</DialogTitle>
            <DialogDescription>
              Ingresa la fecha y observación para desasignar este equipo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="unassign-date">Fecha de desasignación</Label>
              <Input
                id="unassign-date"
                type="date"
                value={unassignDate}
                onChange={(e) => setUnassignDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unassign-observation">Observación</Label>
              <Input
                id="unassign-observation"
                placeholder="Observación (opcional)"
                value={unassignObservation}
                onChange={(e) => setUnassignObservation(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setUnassignDialog({ open: false, assignmentId: null })
              }
              disabled={isUnassigning}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleUnassignConfirm}
              disabled={isUnassigning}
            >
              {isUnassigning ? "Desasignando..." : "Desasignar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

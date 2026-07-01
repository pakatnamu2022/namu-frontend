"use client";

import { useState } from "react";
import { UserX, Pencil, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AttendanceExclusionModal from "@/features/gp/gestionhumana/asistencias/exclusiones/components/AttendanceExclusionModal";
import { useAttendanceExclusions } from "@/features/gp/gestionhumana/asistencias/exclusiones/lib/attendance-exclusion.hook";

interface Props {
  workerId: number;
  workerName: string;
}

export const WorkerAttendanceExclusion = ({ workerId, workerName }: Props) => {
  const [open, setOpen] = useState(false);

  const { data } = useAttendanceExclusions({ person_id: workerId, per_page: 1 });
  const exclusion = data?.data?.[0];

  return (
    <div className="flex flex-col gap-2 rounded-lg shadow-sm p-3">
      {exclusion ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm">
              <ShieldOff className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span>No requiere control de asistencia</span>
            </div>
            <Badge variant="ghost" color={exclusion.active ? "green" : "gray"}>
              {exclusion.active ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          {exclusion.reason && (
            <p className="text-xs text-muted-foreground">{exclusion.reason}</p>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="self-start"
            onClick={() => setOpen(true)}
          >
            <Pencil className="h-4 w-4 mr-2" /> Editar exclusión
          </Button>
          <AttendanceExclusionModal
            id={exclusion.id}
            open={open}
            onClose={() => setOpen(false)}
            title="Editar Excluido de Asistencia"
          />
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserX className="h-4 w-4 shrink-0" />
            Sin exclusión de asistencia registrada
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="self-start"
            onClick={() => setOpen(true)}
          >
            <UserX className="h-4 w-4 mr-2" /> Registrar exclusión
          </Button>
          <AttendanceExclusionModal
            id={null}
            open={open}
            onClose={() => setOpen(false)}
            title="Registrar Excluido de Asistencia"
            presetPersonId={workerId}
            presetPersonName={workerName}
          />
        </>
      )}
    </div>
  );
};

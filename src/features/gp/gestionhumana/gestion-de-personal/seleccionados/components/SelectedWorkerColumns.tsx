"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { FileUp, Mail, Redo2, UserCheck, UserPlus } from "lucide-react";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { SelectedWorkerResource } from "../lib/selectedWorker.interface.ts";
import { LIFE_STATUS } from "../lib/selectedWorker.constant.ts";

export type SelectedWorkerColumns = ColumnDef<SelectedWorkerResource>;

export const selectedWorkerColumns = ({
  onUploadSignedLetter,
  onSendWelcomeEmail,
  onGenerateUser,
  onLifeStatus,
  onRehire,
}: {
  onUploadSignedLetter: (row: SelectedWorkerResource, file: File) => void;
  onSendWelcomeEmail: (row: SelectedWorkerResource) => void;
  onGenerateUser: (row: SelectedWorkerResource) => void;
  onLifeStatus: (row: SelectedWorkerResource) => void;
  onRehire: (row: SelectedWorkerResource) => void;
}): SelectedWorkerColumns[] => [
  {
    accessorKey: "nombre_completo",
    header: "Trabajador",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold">{row.original.nombre_completo}</span>
        <span className="text-[11px] text-muted-foreground">
          DNI {row.original.vat}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "cargo",
    header: "Cargo / Sede",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{row.original.cargo ?? "-"}</span>
        <span className="text-[11px] text-muted-foreground">
          {row.original.sede}
        </span>
      </div>
    ),
  },
  {
    id: "carta_oferta",
    header: "Carta oferta",
    cell: ({ row }) => (
      <Badge variant={row.original.carta_oferta_firmada ? "default" : "secondary"}>
        {row.original.carta_oferta_firmada ? "Firmada" : "Pendiente"}
      </Badge>
    ),
  },
  {
    id: "estado_altabaja",
    header: "Alta / Baja",
    cell: ({ row }) => {
      const estado = row.original.estado_altabaja;
      return (
        <Badge
          variant="outline"
          className={
            estado === "Alta"
              ? "border-green-600 text-green-700"
              : estado === "Baja"
                ? "border-red-600 text-red-700"
                : ""
          }
        >
          {estado ?? "Sin definir"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const fileInputRef = useRef<HTMLInputElement>(null);
      const worker = row.original;
      const isCesado = worker.status_id === LIFE_STATUS.BAJA;

      return (
        <div className="flex items-center gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUploadSignedLetter(worker, file);
              e.target.value = "";
            }}
          />
          <ButtonAction
            icon={FileUp}
            color="blue"
            tooltip="Subir carta oferta firmada"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          />
          <ButtonAction
            icon={Mail}
            color="indigo"
            tooltip="Enviar email de bienvenida"
            type="button"
            onClick={() => onSendWelcomeEmail(worker)}
          />
          <ButtonAction
            icon={UserPlus}
            color="violet"
            tooltip="Generar / reactivar usuario"
            type="button"
            onClick={() => onGenerateUser(worker)}
          />
          {isCesado ? (
            <ButtonAction
              icon={Redo2}
              color="blue"
              tooltip="Reingresar"
              type="button"
              onClick={() => onRehire(worker)}
            />
          ) : (
            <ButtonAction
              icon={UserCheck}
              color="green"
              tooltip="Dar de alta / baja"
              type="button"
              onClick={() => onLifeStatus(worker)}
            />
          )}
        </div>
      );
    },
  },
];

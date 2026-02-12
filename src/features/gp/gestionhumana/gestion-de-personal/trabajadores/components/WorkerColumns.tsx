"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface.ts";
import { Button } from "@/components/ui/button.tsx";
import { Hourglass, Pencil, Signature } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { WORKER } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.constant.ts";

const { ROUTE_UPDATE } = WORKER;

export type WorkerColumns = ColumnDef<WorkerResource>;

export const workerColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
}): WorkerColumns[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "document",
    header: "Documento",
  },
  {
    accessorKey: "sede",
    header: "Sede",
  },
  {
    accessorKey: "position",
    header: "Cargo",
  },
  {
    accessorKey: "emailOfferLetterStatus",
    header: "Carta Oferta",
    cell: ({ row }) => {
      const offerLetterConfirmationId = row.original.offerLetterConfirmationId;
      const offerLetterConfirmation = row.original.offerLetterConfirmation;
      return (
        <Badge
          color={offerLetterConfirmationId === 21 ? "green" : "orange"}
          className="flex gap-2 w-fit"
        >
          {offerLetterConfirmationId === 21 ? (
            <Signature className="text-primary size-4" />
          ) : (
            <Hourglass className="size-4" />
          )}
          {offerLetterConfirmation}
        </Badge>
      );
    },
  },
  {
    accessorKey: "offerLetterConfirmation",
    header: "Carta Oferta",
    cell: ({ row }) => {
      const emailOfferLetterStatusId = row.original.emailOfferLetterStatusId;
      const emailOfferLetterStatus = row.original.emailOfferLetterStatus;
      return (
        <Badge
          color={emailOfferLetterStatusId === 21 ? "green" : "orange"}
          className="flex gap-2 w-fit"
        >
          {emailOfferLetterStatusId === 21 ? (
            <Signature className="text-primary size-4" />
          ) : (
            <Hourglass className="size-4" />
          )}
          {emailOfferLetterStatus}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const router = useNavigate();
      const id = row.original.id;

      return (
        <div className="flex items-center gap-2">
          {/* Edit */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
          >
            <Pencil className="size-5" />
          </Button>
          {/* Delete */}
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];

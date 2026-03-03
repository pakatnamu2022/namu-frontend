"use client";

import { Button } from "@/components/ui/button";
import {
  BookCheck,
  FilePlus,
  Files,
  Plus,
  RefreshCw,
  Send,
} from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useNavigate } from "react-router-dom";
import { ELECTRONIC_DOCUMENT } from "../lib/electronicDocument.constants";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import {
  dispatchAllElectronicDocuments,
  syncAccountingStatus,
} from "../lib/electronicDocument.actions";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { MigrationAllResponse } from "../lib/electronicDocument.interface";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { useState } from "react";

interface ElectronicDocumentActionsProps {
  onRefresh: () => void;
  isLoading: boolean;
  permissions: {
    canCreate: boolean;
  };
}

export default function ElectronicDocumentActions({
  onRefresh,
  isLoading,
  permissions,
}: ElectronicDocumentActionsProps) {
  const router = useNavigate();
  const { ROUTE_ADD } = ELECTRONIC_DOCUMENT;

  const [migrationResult, setMigrationResult] =
    useState<MigrationAllResponse | null>(null);

  const dispatchAllMutation = useMutation({
    mutationFn: dispatchAllElectronicDocuments,
    onSuccess: (data: MigrationAllResponse) => {
      setMigrationResult(data);
      onRefresh();
    },
    onError: () => {
      toast.error("Error al iniciar la migración");
    },
  });

  const syncAccountingMutation = useMutation({
    mutationFn: syncAccountingStatus,
    onSuccess: () => {
      toast.success("Contabilizaciones sincronizadas correctamente");
      onRefresh();
    },
    onError: () => {
      toast.error("Error al consultar contabilizaciones");
    },
  });

  return (
    <>
    <GeneralModal
      open={!!migrationResult}
      onClose={() => setMigrationResult(null)}
      title="Migración iniciada"
      subtitle={`Se despacharon ${migrationResult?.total_dispatched ?? 0} documentos. Revisa el historial de migración para más detalles.`}
      icon="Send"
      size="2xl"
    >
      <ul className="divide-y">
        {migrationResult?.dispatched.map((item) => (
          <li key={item.number} className="flex justify-between py-2 text-sm">
            <span className="font-medium">Documento ID {item.number}</span>
            <span className="text-muted-foreground">
              {item.reason?.description || "En proceso"}
            </span>
          </li>
        ))}
      </ul>
    </GeneralModal>
    <ActionsWrapper>
      <Button size="sm" variant="outline" onClick={onRefresh}>
        <RefreshCw
          className={cn("size-4 mr-2", { "animate-spin": isLoading })}
        />
        Actualizar
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={() => syncAccountingMutation.mutate()}
        disabled={syncAccountingMutation.isPending}
      >
        <BookCheck
          className={cn("size-4 mr-2", {
            "animate-pulse": syncAccountingMutation.isPending,
          })}
        />
        Contabilizaciones
      </Button>

      <ConfirmationDialog
        trigger={
          <Button
            size="sm"
            variant="outline"
            disabled={dispatchAllMutation.isPending}
          >
            <Send
              className={cn("size-4 mr-2", {
                "animate-pulse": dispatchAllMutation.isPending,
              })}
            />
            Migrar Todo
          </Button>
        }
        onConfirm={() => dispatchAllMutation.mutate()}
        title="Confirmar Migración"
        description="¿Estás seguro de que deseas iniciar la migración de todos los documentos electrónicos? Esta acción puede tardar varios minutos."
        confirmText="Sí, iniciar migración"
        cancelText="Cancelar"
      />

      {permissions.canCreate && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm">
              <Plus className="size-4 mr-2" />
              Nuevo Comprobante
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuItem onClick={() => router(ROUTE_ADD)}>
              <FilePlus className="size-4 mr-2" />
              Venta Vehiculo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router(`${ROUTE_ADD}-otros`)}>
              <Files className="size-4 mr-2" />
              Otras Ventas
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </ActionsWrapper>
    </>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { BookCheck, FilePlus, Files, Plus, RefreshCw, Send } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useNavigate } from "react-router-dom";
import { ELECTRONIC_DOCUMENT } from "../lib/electronicDocument.constants";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { dispatchAllElectronicDocuments, syncAccountingStatus } from "../lib/electronicDocument.actions";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const dispatchAllMutation = useMutation({
    mutationFn: dispatchAllElectronicDocuments,
    onSuccess: () => {
      toast.success("Migración iniciada correctamente");
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
        Consultar Contabilizaciones
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={() => dispatchAllMutation.mutate()}
        disabled={dispatchAllMutation.isPending}
      >
        <Send
          className={cn("size-4 mr-2", {
            "animate-pulse": dispatchAllMutation.isPending,
          })}
        />
        Migrar Todo
      </Button>

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
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { FilePlus, Files, Plus, RefreshCw } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useNavigate } from "react-router-dom";
import { ELECTRONIC_DOCUMENT } from "../lib/electronicDocument.constants";
import { cn } from "@/lib/utils";

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

  return (
    <ActionsWrapper>
      <Button size="sm" variant="outline" onClick={onRefresh}>
        <RefreshCw
          className={cn("size-4 mr-2", { "animate-spin": isLoading })}
        />
        Actualizar
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

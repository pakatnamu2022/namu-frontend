"use client";

import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BarChart3, Network } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/features/auth/lib/auth.store";

export default function TeamActions() {
  const { user } = useAuthStore();
  const isJefe = !!user?.subordinates && user.subordinates > 0;

  const hierarchyButton = (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      disabled={!isJefe}
      asChild={isJefe}
    >
      {isJefe ? (
        <Link to="/perfil/equipo/jerarquica">
          <Network className="h-4 w-4" />
          Jerarquía
        </Link>
      ) : (
        <>
          <Network className="h-4 w-4" />
          Jerarquía
        </>
      )}
    </Button>
  );

  return (
    <ActionsWrapper>
      {isJefe ? (
        hierarchyButton
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">{hierarchyButton}</span>
          </TooltipTrigger>
          <TooltipContent>
            Disponible solo si tienes personal a tu cargo
          </TooltipContent>
        </Tooltip>
      )}
      <Link to="/perfil/equipo/indicadores">
        <Button variant="outline" size="sm" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          Indicadores
        </Button>
      </Link>
    </ActionsWrapper>
  );
}

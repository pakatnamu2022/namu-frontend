"use client";

import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import Link from "next/link";

export default function TeamActions() {
  return (
    <ActionsWrapper>
      <Link href="/perfil/equipo/indicadores">
        <Button variant="outline" size="sm" className="gap-2">
          <BarChart3 className="h-4 w-4" />
          Indicadores
        </Button>
      </Link>
    </ActionsWrapper>
  );
}

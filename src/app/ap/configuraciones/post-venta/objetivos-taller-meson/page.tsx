"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Settings2 } from "lucide-react";
import PageSkeleton from "@/shared/components/PageSkeleton.tsx";
import TitleComponent from "@/shared/components/TitleComponent.tsx";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper.tsx";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions.ts";
import { notFound } from "@/shared/hooks/useNotFound.ts";
import { CONCEPT_OBJECTIVE_PV } from "@/features/ap/configuraciones/postventa/objetivos-taller-meson/lib/conceptObjectiveMasterPv.constants";
import ConceptObjectivePvSheet from "@/features/ap/configuraciones/postventa/objetivos-taller-meson/components/ConceptObjectiveMasterPvSheet";
import ObjectiveSedePeriodPvPicker from "@/features/ap/configuraciones/postventa/objetivos-taller-meson/objetivo-sede-periodo/components/ObjectiveSedePeriodPvPicker";

export default function ConceptObjectivePvPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [open, setOpen] = useState(false);
  const { MODEL, ROUTE } = CONCEPT_OBJECTIVE_PV;
  const permissions = useModulePermissions(ROUTE);

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={MODEL.plural}
          icon={currentView.icon}
        />
        {(permissions.canCreate || permissions.canUpdate) && (
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() => setOpen(true)}
          >
            <Settings2 className="size-4 mr-2" />
            Actualizar Conceptos Maestros
          </Button>
        )}
      </HeaderTableWrapper>

      <ObjectiveSedePeriodPvPicker />

      <ConceptObjectivePvSheet open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

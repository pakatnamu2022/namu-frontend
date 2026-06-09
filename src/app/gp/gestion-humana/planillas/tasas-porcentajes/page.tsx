"use client";

import { useState } from "react";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import TitleComponent from "@/shared/components/TitleComponent";
import PageSkeleton from "@/shared/components/PageSkeleton";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import SearchInput from "@/shared/components/SearchInput";
import { errorToast, successToast } from "@/core/core.function";
import { notFound } from "@/shared/hooks/useNotFound";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useGeneralMasters } from "@/features/gp/maestros-generales/lib/generalMasters.hook";
import { updateGeneralMasters } from "@/features/gp/maestros-generales/lib/generalMasters.actions";
import GeneralMastersModal from "@/features/gp/maestros-generales/components/GeneralMastersModal";
import PayrollRatesMatrix, {
  type AddCellPayload,
} from "@/features/gp/maestros-generales/components/PayrollRatesMatrix";
import {
  INSURANCE_PREMIUM_TYPE,
  MANDATORY_CONTRIBUTION_TYPE,
  PAYROLL_RATES_PERCENTAJES,
  VARIABLE_COMMISSION_TYPE,
} from "@/features/gp/maestros-generales/lib/generalMasters.constants";

const RATES_PERCENTAGES_TYPES = [
  MANDATORY_CONTRIBUTION_TYPE,
  INSURANCE_PREMIUM_TYPE,
  VARIABLE_COMMISSION_TYPE,
];

export default function PayrollRatesPercentagesPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const { ROUTE } = PAYROLL_RATES_PERCENTAJES;
  const permissions = useModulePermissions(ROUTE);

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [addCell, setAddCell] = useState<AddCellPayload | null>(null);

  const { data, isLoading, refetch } = useGeneralMasters({
    params: {
      all: "true",
      type: RATES_PERCENTAGES_TYPES,
    },
  });

  const handleSaveValue = async (id: number, value: string) => {
    try {
      await updateGeneralMasters(id, { value });
      await refetch();
      successToast("Valor actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el valor.");
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle="Variables de planilla"
          icon={currentView.icon}
        />
        {permissions.canCreate && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Constante
          </Button>
        )}
      </HeaderTableWrapper>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por código o descripción..."
      />

      <PayrollRatesMatrix
        data={(Array.isArray(data) ? data : data?.data) ?? []}
        isLoading={isLoading}
        onSaveValue={handleSaveValue}
        onAdd={setAddCell}
        permissions={permissions}
        search={search}
      />

      {showCreate && (
        <GeneralMastersModal
          open={showCreate}
          onClose={() => {
            setShowCreate(false);
            refetch();
          }}
          mode="create"
          allowedTypes={RATES_PERCENTAGES_TYPES}
        />
      )}

      {addCell !== null && (
        <GeneralMastersModal
          open={true}
          onClose={() => {
            setAddCell(null);
            refetch();
          }}
          mode="create"
          defaultCode={addCell.code}
          lockedCode
          defaultDescription={addCell.description}
          lockedDescription
          defaultType={addCell.type}
          lockedType
          allowedTypes={RATES_PERCENTAGES_TYPES}
        />
      )}
    </div>
  );
}

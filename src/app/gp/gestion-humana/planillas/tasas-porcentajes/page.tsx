"use client";

import { useState } from "react";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import TitleComponent from "@/shared/components/TitleComponent";
import PageSkeleton from "@/shared/components/PageSkeleton";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import SearchInput from "@/shared/components/SearchInput";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { notFound } from "@/shared/hooks/useNotFound";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useGeneralMasters } from "@/features/gp/maestros-generales/lib/generalMasters.hook";
import {
  deleteGeneralMasters,
  updateGeneralMasters,
} from "@/features/gp/maestros-generales/lib/generalMasters.actions";
import GeneralMastersModal from "@/features/gp/maestros-generales/components/GeneralMastersModal";
import PayrollRatesMatrix from "@/features/gp/maestros-generales/components/PayrollRatesMatrix";
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
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [updateId, setUpdateId] = useState<number | null>(null);

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

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateGeneralMasters(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteGeneralMasters(deleteId);
      successToast(
        SUCCESS_MESSAGE(
          { name: "Constante", plural: "Constantes", gender: false },
          "delete",
        ),
      );
      await refetch();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(
        ERROR_MESSAGE(
          { name: "Constante", plural: "Constantes", gender: false },
          "delete",
          msg,
        ),
      );
    } finally {
      setDeleteId(null);
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
        onToggleStatus={handleToggleStatus}
        onDelete={setDeleteId}
        permissions={permissions}
        search={search}
      />

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {showCreate && (
        <GeneralMastersModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          mode="create"
          allowedTypes={RATES_PERCENTAGES_TYPES}
        />
      )}

      {updateId !== null && (
        <GeneralMastersModal
          id={updateId}
          open={true}
          onClose={() => setUpdateId(null)}
          mode="update"
          allowedTypes={RATES_PERCENTAGES_TYPES}
        />
      )}
    </div>
  );
}

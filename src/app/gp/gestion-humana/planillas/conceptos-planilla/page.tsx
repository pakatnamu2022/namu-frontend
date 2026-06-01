"use client";

import { useState } from "react";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import TitleComponent from "@/shared/components/TitleComponent";
import PageSkeleton from "@/shared/components/PageSkeleton";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { notFound } from "@/shared/hooks/useNotFound";
import { SortingState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useGpMasters } from "@/features/gp/gp-master/lib/gpMaster.hook";
import {
  deleteGpMasters,
  updateGpMasters,
} from "@/features/gp/gp-master/lib/gpMaster.actions";
import GpMasterTable from "@/features/gp/gp-master/components/GpMasterTable";
import { gpMasterColumns } from "@/features/gp/gp-master/components/GpMasterColumns";
import GpMasterModal from "@/features/gp/gp-master/components/GpMasterModal";
import GeneralMastersOptions from "@/features/gp/maestros-generales/components/GeneralMastersOptions";
import {
  GP_MASTER_TYPE,
  GP_MASTER_TYPE_CONFIG,
  PAYROLL_CONCEPTS,
} from "@/features/gp/gp-master/lib/gpMaster.constants";

const PAYROLL_CONCEPTS_TYPES = [
  GP_MASTER_TYPE.PAYROLL_LIQUIDATION_BBSS_TYPE,
  GP_MASTER_TYPE.PAYROLL_BUNESES,
  GP_MASTER_TYPE.PAYROLL_LOAN,
];

const PAYROLL_CONCEPTS_TYPE_LABELS = Object.fromEntries(
  PAYROLL_CONCEPTS_TYPES.map((type) => [
    type,
    GP_MASTER_TYPE_CONFIG[type]?.label ?? type,
  ]),
);

export default function PayrollConceptsPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const { ROUTE } = PAYROLL_CONCEPTS;
  const permissions = useModulePermissions(ROUTE);

  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, refetch } = useGpMasters({
    params: {
      page,
      search,
      per_page,
      type: selectedType ? [selectedType] : PAYROLL_CONCEPTS_TYPES,
    },
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateGpMasters(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteGpMasters(deleteId);
      successToast(SUCCESS_MESSAGE(PAYROLL_CONCEPTS.MODEL, "delete"));
      await refetch();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(PAYROLL_CONCEPTS.MODEL, "delete", msg));
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
          subtitle="Conceptos de planilla"
          icon={currentView.icon}
        />
        {permissions.canCreate && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Concepto
          </Button>
        )}
      </HeaderTableWrapper>

      <GpMasterTable
        isLoading={isLoading}
        columns={gpMasterColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
          typeConfig: GP_MASTER_TYPE_CONFIG,
        })}
        data={data?.data || []}
        sorting={sorting}
        onSortingChange={setSorting}
        manualSorting={true}
      >
        <GeneralMastersOptions
          search={search}
          setSearch={setSearch}
          showTypeSelect
          typeOptions={PAYROLL_CONCEPTS_TYPES}
          typeLabels={PAYROLL_CONCEPTS_TYPE_LABELS}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
        />
      </GpMasterTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {showCreate && (
        <GpMasterModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          mode="create"
          allowedTypes={PAYROLL_CONCEPTS_TYPES}
          typeLabels={PAYROLL_CONCEPTS_TYPE_LABELS}
        />
      )}

      {updateId !== null && (
        <GpMasterModal
          id={updateId}
          open={true}
          onClose={() => setUpdateId(null)}
          mode="update"
          allowedTypes={PAYROLL_CONCEPTS_TYPES}
          typeLabels={PAYROLL_CONCEPTS_TYPE_LABELS}
        />
      )}

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        totalData={data?.meta?.total || 0}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
      />
    </div>
  );
}

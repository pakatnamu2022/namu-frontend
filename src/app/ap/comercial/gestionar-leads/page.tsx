"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import {
  DEFAULT_PER_PAGE,
  EMPRESA_AP,
  TIPO_LEADS,
} from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { MANAGE_LEADS } from "@/features/ap/comercial/gestionar-leads/lib/manageLeads.constants";
import { useManageLeads } from "@/features/ap/comercial/gestionar-leads/lib/manageLeads.hook";
import {
  deleteManageLeads,
  assignWorkersToLeads,
} from "@/features/ap/comercial/gestionar-leads/lib/manageLeads.actions";
import ManageLeadsActions from "@/features/ap/comercial/gestionar-leads/components/ManageLeadsActions";
import ManageLeadsTable from "@/features/ap/comercial/gestionar-leads/components/ManageLeadsTable";
import { manageLeadsColumns } from "@/features/ap/comercial/gestionar-leads/components/ManageLeadsColumns";
import ManageLeadsOptions from "@/features/ap/comercial/gestionar-leads/components/ManageLeadsOptions";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";

export default function ManageLeadsPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [sedeId, setSedeId] = useState<string>("");
  const currentDate = new Date();

  const [dateFrom, setDateFrom] = useState<Date | undefined>(currentDate);
  const [dateTo, setDateTo] = useState<Date | undefined>(currentDate);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL, ROUTE } = MANAGE_LEADS;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page, statusFilter, conditionFilter]);

  const formatDate = (date: Date | undefined) => {
    return date ? date.toLocaleDateString("en-CA") : undefined; // formato: YYYY-MM-DD
  };

  const { data, isLoading, refetch } = useManageLeads({
    page,
    search,
    per_page,
    created_at:
      dateFrom && dateTo
        ? [formatDate(dateFrom), formatDate(dateTo)]
        : undefined,
    type: TIPO_LEADS.LEADS,
    status_num_doc: statusFilter !== "all" ? statusFilter : undefined,
    use: conditionFilter !== "all" ? conditionFilter : undefined,
    sort: "created_at",
    sede_id: sedeId,
  });

  const { data: sedes = [] } = useAllSedes({
    empresa_id: EMPRESA_AP.id,
  });

  const handleImportSuccess = () => {
    refetch(); // Refresca la tabla para mostrar los nuevos datos
  };

  const handleRefresh = async () => {
    try {
      const response = await assignWorkersToLeads();
      if (response.success) {
        successToast(response.message);
        await refetch(); // Actualiza los datos de la tabla después de asignar
      } else {
        errorToast(response.message || "Error al asignar trabajadores");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || "Error al asignar trabajadores");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteManageLeads(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
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
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <ManageLeadsActions
          dateFrom={dateFrom}
          dateTo={dateTo}
          onImportSuccess={handleImportSuccess}
          onRefresh={handleRefresh}
          permissions={permissions}
        />
      </HeaderTableWrapper>
      <ManageLeadsTable
        isLoading={isLoading}
        columns={manageLeadsColumns({
          onDelete: setDeleteId,
          permissions,
        })}
        data={data?.data || []}
      >
        <ManageLeadsOptions
          search={search}
          setSearch={setSearch}
          sedes={sedes}
          sedeId={sedeId}
          setSedeId={setSedeId}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          conditionFilter={conditionFilter}
          setConditionFilter={setConditionFilter}
        />
      </ManageLeadsTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
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

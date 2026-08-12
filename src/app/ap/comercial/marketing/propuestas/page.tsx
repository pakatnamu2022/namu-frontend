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
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { PROPOSALS } from "@/features/ap/comercial/marketing/propuestas/lib/proposals.constants";
import { useProposals } from "@/features/ap/comercial/marketing/propuestas/lib/proposals.hook";
import {
  approveProposal,
  deleteProposals,
  rejectProposal,
} from "@/features/ap/comercial/marketing/propuestas/lib/proposals.actions";
import ProposalsActions from "@/features/ap/comercial/marketing/propuestas/components/ProposalsActions";
import ProposalsTable from "@/features/ap/comercial/marketing/propuestas/components/ProposalsTable";
import { proposalsColumns } from "@/features/ap/comercial/marketing/propuestas/components/ProposalsColumns";
import ProposalsOptions from "@/features/ap/comercial/marketing/propuestas/components/ProposalsOptions";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";

export default function MarketingProposalsPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL, ROUTE } = PROPOSALS;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useProposals({ page, search, per_page });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProposals(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveProposal(id);
      await refetch();
      successToast("Propuesta aprobada correctamente.");
    } catch {
      errorToast("Error al aprobar la propuesta.");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectProposal(id);
      await refetch();
      successToast("Propuesta rechazada correctamente.");
    } catch {
      errorToast("Error al rechazar la propuesta.");
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
        <ProposalsActions permissions={permissions} />
      </HeaderTableWrapper>
      <ProposalsTable
        isLoading={isLoading}
        columns={proposalsColumns({
          onDelete: setDeleteId,
          onApprove: handleApprove,
          onReject: handleReject,
          permissions,
        })}
        data={data?.data || []}
      >
        <ProposalsOptions search={search} setSearch={setSearch} />
      </ProposalsTable>

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

"use client";

import PageSkeleton from "@/shared/components/PageSkeleton";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
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
import { REASONS_REJECTION } from "@/features/ap/comercial/motivos-descarte/lib/reasonsRejection.constants";
import { useReasonsRejection } from "@/features/ap/comercial/motivos-descarte/lib/reasonsRejection.hook";
import {
  deleteReasonsRejection,
  updateReasonsRejection,
} from "@/features/ap/comercial/motivos-descarte/lib/reasonsRejection.actions";
import ReasonsRejectionActions from "@/features/ap/comercial/motivos-descarte/components/ReasonsRejectionActions";
import { reasonsRejectionColumns } from "@/features/ap/comercial/motivos-descarte/components/ReasonsRejectionColumns";
import ReasonsRejectionTable from "@/features/ap/comercial/motivos-descarte/components/ReasonsRejectionTable";
import ReasonsRejectionOptions from "@/features/ap/comercial/motivos-descarte/components/ReasonsRejectionOptions";
import ReasonsRejectionModal from "@/features/ap/comercial/motivos-descarte/components/ReasonsRejectionModal";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";


export default function ReasonsRejectionPage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = REASONS_REJECTION;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useReasonsRejection({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateReasonsRejection(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteReasonsRejection(deleteId);
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
          subtitle={"Gestión de motivos de descarte"}
          icon={currentView.icon}
        />
        <ReasonsRejectionActions permissions={permissions} />
      </HeaderTableWrapper>
      <ReasonsRejectionTable
        isLoading={isLoading}
        columns={reasonsRejectionColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <ReasonsRejectionOptions search={search} setSearch={setSearch} />
      </ReasonsRejectionTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <ReasonsRejectionModal
          id={updateId}
          title={"Actualizar Motivo de Descarte"}
          open={true}
          onClose={() => {
            setUpdateId(null);
          }}
          mode="update"
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

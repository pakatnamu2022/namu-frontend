"use client";

import { notFound } from "next/navigation";
import PageSkeleton from "@/src/shared/components/PageSkeleton";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import TitleComponent from "@/src/shared/components/TitleComponent";
import DataTablePagination from "@/src/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/src/shared/components/SimpleDeleteDialog";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { DEFAULT_PER_PAGE } from "@/src/core/core.constants";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";
import { VOUCHER_TYPE } from "@/src/features/ap/configuraciones/maestros-general/tipos-comprobante/lib/voucherTypes.constants";
import { useVoucherTypes } from "@/src/features/ap/configuraciones/maestros-general/tipos-comprobante/lib/voucherTypes.hook";
import {
  deleteVoucherTypes,
  updateVoucherTypes,
} from "@/src/features/ap/configuraciones/maestros-general/tipos-comprobante/lib/voucherTypes.actions";
import VoucherTypesActions from "@/src/features/ap/configuraciones/maestros-general/tipos-comprobante/components/VoucherTypesActions";
import VoucherTypesTable from "@/src/features/ap/configuraciones/maestros-general/tipos-comprobante/components/VoucherTypesTable";
import { voucherTypesColumns } from "@/src/features/ap/configuraciones/maestros-general/tipos-comprobante/components/VoucherTypesColumns";
import VoucherTypesOptions from "@/src/features/ap/configuraciones/maestros-general/tipos-comprobante/components/VoucherTypesOptions";
import VoucherTypesModal from "@/src/features/ap/configuraciones/maestros-general/tipos-comprobante/components/VoucherTypesModal";
import { useModulePermissions } from "@/src/shared/hooks/useModulePermissions";

export default function VoucherTypesPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = VOUCHER_TYPE;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useVoucherTypes({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateVoucherTypes(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteVoucherTypes(deleteId);
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
          subtitle={"Tipos de Comprobante"}
          icon={currentView.icon}
        />
        <VoucherTypesActions permissions={permissions} />
      </HeaderTableWrapper>
      <VoucherTypesTable
        isLoading={isLoading}
        columns={voucherTypesColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <VoucherTypesOptions search={search} setSearch={setSearch} />
      </VoucherTypesTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <VoucherTypesModal
          id={updateId}
          title={"Actualizar Tipo de Comprobante"}
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

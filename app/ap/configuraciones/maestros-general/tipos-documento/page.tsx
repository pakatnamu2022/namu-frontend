"use client";

import { notFound } from "next/navigation";
import PageSkeleton from "@/src/shared/components/PageSkeleton";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import TitleComponent from "@/src/shared/components/TitleComponent";
import { SimpleDeleteDialog } from "@/src/shared/components/SimpleDeleteDialog";
import DataTablePagination from "@/src/shared/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/src/core/core.constants";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";
import { DOCUMENT_TYPE } from "@/src/features/ap/configuraciones/maestros-general/tipos-documento/lib/documentTypes.constants";
import { useDocumentType } from "@/src/features/ap/configuraciones/maestros-general/tipos-documento/lib/documentTypes.hook";
import {
  deleteDocumentType,
  updateDocumentType,
} from "@/src/features/ap/configuraciones/maestros-general/tipos-documento/lib/documentTypes.actions";
import DocumentTypeActions from "@/src/features/ap/configuraciones/maestros-general/tipos-documento/components/DocumentTypesActions";
import DocumentTypeTable from "@/src/features/ap/configuraciones/maestros-general/tipos-documento/components/DocumentTypesTable";
import { documentTypeColumns } from "@/src/features/ap/configuraciones/maestros-general/tipos-documento/components/DocumentTypesColumns";
import DocumentTypeOptions from "@/src/features/ap/configuraciones/maestros-general/tipos-documento/components/DocumentTypesOptions";
import DocumentTypeModal from "@/src/features/ap/configuraciones/maestros-general/tipos-documento/components/DocumentTypesModal";
import { useModulePermissions } from "@/src/shared/hooks/useModulePermissions";

export default function DocumentTypePage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = DOCUMENT_TYPE;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useDocumentType({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateDocumentType(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDocumentType(deleteId);
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
          subtitle={"Tipos de documento"}
          icon={currentView.icon}
        />
        <DocumentTypeActions permissions={permissions} />
      </HeaderTableWrapper>
      <DocumentTypeTable
        isLoading={isLoading}
        columns={documentTypeColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <DocumentTypeOptions search={search} setSearch={setSearch} />
      </DocumentTypeTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <DocumentTypeModal
          id={updateId}
          title={"Actualizar Tipo de Documento"}
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

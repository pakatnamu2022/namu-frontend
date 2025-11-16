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
import { TAX_CLASS_TYPES } from "@/features/ap/configuraciones/maestros-general/tipos-clase-impuesto/lib/taxClassTypes.constants";
import { useTaxClassTypes } from "@/features/ap/configuraciones/maestros-general/tipos-clase-impuesto/lib/taxClassTypes.hook";
import {
  deleteTaxClassTypes,
  updateTaxClassTypes,
} from "@/features/ap/configuraciones/maestros-general/tipos-clase-impuesto/lib/taxClassTypes.actions";
import TaxClassTypesActions from "@/features/ap/configuraciones/maestros-general/tipos-clase-impuesto/components/TaxClassTypesActions";
import TaxClassTypesTable from "@/features/ap/configuraciones/maestros-general/tipos-clase-impuesto/components/TaxClassTypesTable";
import { taxClassTypesColumns } from "@/features/ap/configuraciones/maestros-general/tipos-clase-impuesto/components/TaxClassTypesColumns";
import TaxClassTypesOptions from "@/features/ap/configuraciones/maestros-general/tipos-clase-impuesto/components/TaxClassTypesOptions";
import TaxClassTypesModal from "@/features/ap/configuraciones/maestros-general/tipos-clase-impuesto/components/TaxClassTypesModal";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import NotFound from '@/app/not-found';


export default function TaxClassTypesPage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = TAX_CLASS_TYPES;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useTaxClassTypes({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateTaxClassTypes(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTaxClassTypes(deleteId);
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
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={"Tipos Clase Impuesto"}
          icon={currentView.icon}
        />
        <TaxClassTypesActions permissions={permissions} />
      </HeaderTableWrapper>
      <TaxClassTypesTable
        isLoading={isLoading}
        columns={taxClassTypesColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <TaxClassTypesOptions search={search} setSearch={setSearch} />
      </TaxClassTypesTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <TaxClassTypesModal
          id={updateId}
          title={"Actualizar Tipo Clase Impuesto"}
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

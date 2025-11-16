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
import { useCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import {
  deleteCurrencyTypes,
  updateCurrencyTypes,
} from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.actions";
import CurrencyTypesActions from "@/features/ap/configuraciones/maestros-general/tipos-moneda/components/CurrencyTypesActions";
import CurrencyTypesTable from "@/features/ap/configuraciones/maestros-general/tipos-moneda/components/CurrencyTypesTable";
import { currencyTypesColumns } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/components/CurrencyTypesColumns";
import CurrencyTypesOptions from "@/features/ap/configuraciones/maestros-general/tipos-moneda/components/CurrencyTypesOptions";
import CurrencyTypesModal from "@/features/ap/configuraciones/maestros-general/tipos-moneda/components/CurrencyTypesModal";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { CURRENCY_TYPES } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.constants";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import NotFound from '@/app/not-found';


export default function CurrencyTypesPage() {
  
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { ROUTE, MODEL } = CURRENCY_TYPES;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useCurrencyTypes({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateCurrencyTypes(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCurrencyTypes(deleteId);
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
          subtitle={"Tipos de Moneda"}
          icon={currentView.icon}
        />
        <CurrencyTypesActions permissions={permissions} />
      </HeaderTableWrapper>
      <CurrencyTypesTable
        isLoading={isLoading}
        columns={currencyTypesColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <CurrencyTypesOptions search={search} setSearch={setSearch} />
      </CurrencyTypesTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <CurrencyTypesModal
          id={updateId}
          title={"Actualizar Tipo Moneda"}
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

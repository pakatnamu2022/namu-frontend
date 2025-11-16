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
import { DEFAULT_PER_PAGE, EMPRESA_AP } from "@/core/core.constants";
import { useApBank } from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.hook";
import {
  deleteApBank,
  updateApBank,
} from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.actions";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import ApBankActions from "@/features/ap/configuraciones/maestros-general/chequeras/components/ApBankActions";
import ApBankTable from "@/features/ap/configuraciones/maestros-general/chequeras/components/ApBankTable";
import ApBankOptions from "@/features/ap/configuraciones/maestros-general/chequeras/components/ApBankOptions";
import { apBankColumns } from "@/features/ap/configuraciones/maestros-general/chequeras/components/ApBankColumns";
import { BANK_AP } from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.constants";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import NotFound from '@/app/not-found';


export default function ApBankPage() {
  
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sedeId, setSedeId] = useState<string>("");
  const { MODEL, ROUTE } = BANK_AP;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useApBank({
    page,
    search,
    per_page,
    sede_id: sedeId,
  });

  const { data: sedes = [] } = useAllSedes({
    empresa_id: EMPRESA_AP.id,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateApBank(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteApBank(deleteId);
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
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <ApBankActions permissions={permissions} />
      </HeaderTableWrapper>
      <ApBankTable
        isLoading={isLoading}
        columns={apBankColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          permissions,
        })}
        data={data?.data || []}
      >
        <ApBankOptions
          search={search}
          setSearch={setSearch}
          sedes={sedes}
          sedeId={sedeId}
          setSedeId={setSedeId}
        />
      </ApBankTable>

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

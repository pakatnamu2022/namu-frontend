"use client";

import { notFound } from "next/navigation";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import PageSkeleton from "@/src/shared/components/PageSkeleton";
import TitleComponent from "@/src/shared/components/TitleComponent";
import DataTablePagination from "@/src/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/src/shared/components/SimpleDeleteDialog";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import {
  DEFAULT_PER_PAGE,
  TYPE_BUSINESS_PARTNERS,
} from "@/src/core/core.constants";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";
import { SUPPLIERS } from "@/src/features/ap/comercial/proveedores/lib/suppliers.constants";
import { useSuppliers } from "@/src/features/ap/comercial/proveedores/lib/suppliers.hook";
import { deleteSuppliers } from "@/src/features/ap/comercial/proveedores/lib/suppliers.actions";
import SuppliersActions from "@/src/features/ap/comercial/proveedores/components/SuppliersActions";
import SuppliersTable from "@/src/features/ap/comercial/proveedores/components/SuppliersTable";
import { suppliersColumns } from "@/src/features/ap/comercial/proveedores/components/SuppliersColumns";
import SuppliersOptions from "@/src/features/ap/comercial/proveedores/components/SuppliersOptions";
import { useModulePermissions } from "@/src/shared/hooks/useModulePermissions";

export default function SuppliersPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL, ROUTE } = SUPPLIERS;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useSuppliers({
    page,
    search,
    per_page,
    type: [TYPE_BUSINESS_PARTNERS.PROVEEDOR, TYPE_BUSINESS_PARTNERS.AMBOS],
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSuppliers(deleteId);
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
        <SuppliersActions permissions={permissions} />
      </HeaderTableWrapper>
      <SuppliersTable
        isLoading={isLoading}
        columns={suppliersColumns({
          onDelete: setDeleteId,
          permissions,
        })}
        data={data?.data || []}
      >
        <SuppliersOptions search={search} setSearch={setSearch} />
      </SuppliersTable>

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

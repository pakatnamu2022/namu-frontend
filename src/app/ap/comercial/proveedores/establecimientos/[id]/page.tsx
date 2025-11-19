"use client";

import { useParams } from "react-router-dom";
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
import { useQuery } from "@tanstack/react-query";
import {
  deleteEstablishments,
  updateEstablishments,
} from "@/features/ap/comercial/establecimientos/lib/establishments.actions";
import { establishmentsColumns } from "@/features/ap/comercial/establecimientos/components/EstablishmentsColumns";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { findCustomersById } from "@/features/ap/comercial/clientes/lib/customers.actions";
import EstablishmentsActions from "@/features/ap/comercial/establecimientos/components/EstablishmentsActions";
import EstablishmentsTable from "@/features/ap/comercial/establecimientos/components/EstablishmentsTable";
import EstablishmentsOptions from "@/features/ap/comercial/establecimientos/components/EstablishmentsOptions";
import { useEstablishments } from "@/features/ap/comercial/establecimientos/lib/establishments.hook";
import { notFound } from "@/shared/hooks/useNotFound";
import BackButton from "@/shared/components/BackButton";
import { SUPPLIERS } from "@/features/ap/comercial/proveedores/lib/suppliers.constants";
import { SUPPLIER_ESTABLISHMENTS } from "@/features/ap/comercial/establecimientos/lib/establishments.constants";

export default function SupplierEstablishmentsListPage() {
  const { id } = useParams();
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL, ABSOLUTE_ROUTE } = SUPPLIER_ESTABLISHMENTS;
  const {
    ABSOLUTE_ROUTE: SUPPLIERS_ABSOLUTE_ROUTE,
    ROUTE,
    QUERY_KEY,
  } = SUPPLIERS;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [per_page]);

  // Get customer data
  const { data: customer, isLoading: loadingCustomer } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findCustomersById(Number(id)),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useEstablishments({
    page,
    search,
    per_page,
    business_partner_id: Number(id),
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateEstablishments(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEstablishments(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoadingModule || loadingCustomer) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView || !customer) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <BackButton name="" size="icon" route={SUPPLIERS_ABSOLUTE_ROUTE} />
        <TitleComponent
          title={`Establecimientos - ${customer.full_name}`}
          subtitle={`Gestiona los establecimientos del cliente ${customer.full_name}`}
          icon={currentView.icon}
        />
        <EstablishmentsActions
          baseRoute={`${ABSOLUTE_ROUTE}/${id}`}
          permissions={permissions}
        />
      </HeaderTableWrapper>

      <EstablishmentsTable
        isLoading={isLoading}
        columns={establishmentsColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          permissions,
          baseRoute: `${ABSOLUTE_ROUTE}/${id}`,
        })}
        data={data?.data || []}
      >
        <EstablishmentsOptions search={search} setSearch={setSearch} />
      </EstablishmentsTable>

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
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
      />
    </div>
  );
}

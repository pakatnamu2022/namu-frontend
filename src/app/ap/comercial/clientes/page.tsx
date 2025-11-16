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
  TYPE_BUSINESS_PARTNERS,
} from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { CUSTOMERS } from "@/features/ap/comercial/clientes/lib/customers.constants";
import { useCustomers } from "@/features/ap/comercial/clientes/lib/customers.hook";
import { deleteCustomers } from "@/features/ap/comercial/clientes/lib/customers.actions";
import CustomersActions from "@/features/ap/comercial/clientes/components/CustomersActions";
import CustomersTable from "@/features/ap/comercial/clientes/components/CustomersTable";
import { customersColumns } from "@/features/ap/comercial/clientes/components/CustomersColumns";
import CustomersOptions from "@/features/ap/comercial/clientes/components/CustomersOptions";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import NotFound from '@/app/not-found';


export default function CustomersPage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL, ROUTE } = CUSTOMERS;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useCustomers({
    page,
    search,
    per_page,
    type: [TYPE_BUSINESS_PARTNERS.CLIENTE, TYPE_BUSINESS_PARTNERS.AMBOS],
    status_ap: 1,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCustomers(deleteId);
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
        <CustomersActions permissions={permissions} />
      </HeaderTableWrapper>
      <CustomersTable
        isLoading={isLoading}
        columns={customersColumns({
          onDelete: setDeleteId,
          permissions,
        })}
        data={data?.data || []}
      >
        <CustomersOptions search={search} setSearch={setSearch} />
      </CustomersTable>

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

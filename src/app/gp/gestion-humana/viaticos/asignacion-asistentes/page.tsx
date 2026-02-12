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
import AccountantDistrictAssignmentActions from "@/features/gp/gestionhumana/viaticos/asignacion-asistentes/components/AccountantDistrictAssignmentActions";
import AccountantDistrictAssignmentTable from "@/features/gp/gestionhumana/viaticos/asignacion-asistentes/components/AccountantDistrictAssignmentTable";
import { accountantDistrictAssignmentColumns } from "@/features/gp/gestionhumana/viaticos/asignacion-asistentes/components/AccountantDistrictAssignmentColumns";
import AccountantDistrictAssignmentOptions from "@/features/gp/gestionhumana/viaticos/asignacion-asistentes/components/AccountantDistrictAssignmentOptions";
import AccountantDistrictAssignmentModal from "@/features/gp/gestionhumana/viaticos/asignacion-asistentes/components/AccountantDistrictAssignmentModal";
import { useGetAccountantDistrictAssignment } from "@/features/gp/gestionhumana/viaticos/asignacion-asistentes/lib/accountantDistrictAssignment.hook";
import { deleteAccountantDistrictAssignment } from "@/features/gp/gestionhumana/viaticos/asignacion-asistentes/lib/accountantDistrictAssignment.actions";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { ACCOUNTANT_DISTRICT_ASSIGNMENT } from "@/features/gp/gestionhumana/viaticos/asignacion-asistentes/lib/accountantDistrictAssignment.constants";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";

export default function AccountantDistrictAssignmentPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = ACCOUNTANT_DISTRICT_ASSIGNMENT;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useGetAccountantDistrictAssignment({
    params: {
      page,
      search,
      per_page,
    },
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAccountantDistrictAssignment(deleteId);
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
          subtitle={"Asignación de Asistentes"}
          icon={currentView.icon}
        />
        <AccountantDistrictAssignmentActions
          currentView={currentView}
          permissions={permissions}
        />
      </HeaderTableWrapper>
      <AccountantDistrictAssignmentTable
        isLoading={isLoading}
        columns={accountantDistrictAssignmentColumns({
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <AccountantDistrictAssignmentOptions
          search={search}
          setSearch={setSearch}
        />
      </AccountantDistrictAssignmentTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <AccountantDistrictAssignmentModal
          id={updateId}
          title={"Actualizar Asignación de Asistente"}
          open={true}
          onClose={() => {
            setUpdateId(null);
          }}
          mode="update"
          currentView={currentView}
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

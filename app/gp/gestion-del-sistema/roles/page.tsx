"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import RoleTable from "@/features/gp/gestionsistema/roles/components/RoleTable";
import { useRoles } from "@/features/gp/gestionsistema/roles/lib/role.hook";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import RoleOptions from "@/features/gp/gestionsistema/roles/components/RoleOptions";
import RoleActions from "@/features/gp/gestionsistema/roles/components/RoleActions";
import { roleColumns } from "@/features/gp/gestionsistema/roles/components/RoleColumns";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { deleteRole } from "@/features/gp/gestionsistema/roles/lib/role.actions";
import { errorToast, successToast } from "@/core/core.function";
import RoleModal from "@/features/gp/gestionsistema/roles/components/RoleModal";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import NotFound from '@/app/not-found';


export default function RolePage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useRoles({
    page,
    search,
    per_page,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteRole(deleteId);
      await refetch();
      successToast("Rol eliminado correctamente.");
    } catch (error) {
      errorToast("Error al eliminar el rol.");
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists("roles")) notFound();
  if (!currentView) return <NotFound />;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={"Roles de Usuarios"}
          icon={currentView.icon}
        />
        <RoleActions />
      </HeaderTableWrapper>
      <RoleTable
        isLoading={isLoading}
        columns={roleColumns({ onDelete: setDeleteId, onUpdate: setUpdateId })}
        data={data?.data || []}
      >
        <RoleOptions search={search} setSearch={setSearch} />
      </RoleTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <RoleModal
          id={updateId}
          title={"Actualizar Rol"}
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
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
      />
    </div>
  );
}

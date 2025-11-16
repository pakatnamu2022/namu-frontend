"use client";

import { notFound } from "next/navigation";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import UserTable from "@/src/features/gp/gestionsistema/usuarios/components/UserTable";
import { useUsers } from "@/src/features/gp/gestionsistema/usuarios/lib/user.hook";
import TitleComponent from "@/src/shared/components/TitleComponent";
import DataTablePagination from "@/src/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import UserOptions from "@/src/features/gp/gestionsistema/usuarios/components/UserOptions";
import UserActions from "@/src/features/gp/gestionsistema/usuarios/components/UserActions";
import { userColumns } from "@/src/features/gp/gestionsistema/usuarios/components/UserColumns";
import PageSkeleton from "@/src/shared/components/PageSkeleton";
import { deleteUser } from "@/src/features/gp/gestionsistema/usuarios/lib/user.actions";
import { errorToast, successToast } from "@/src/core/core.function";
import { SimpleDeleteDialog } from "@/src/shared/components/SimpleDeleteDialog";
import { DEFAULT_PER_PAGE } from "@/src/core/core.constants";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";
import { UserSedesSheet } from "@/src/features/gp/gestionsistema/usuarios/components/UserSedesSheet";
import { UserResource } from "@/src/features/gp/gestionsistema/usuarios/lib/user.interface";

export default function UserPage() {
  // const router = useRouter();
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserResource | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useUsers({
    page,
    search,
    role$nombre: role,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteUser(deleteId);
      await refetch();
      successToast("Usuario eliminado correctamente.");
    } catch (error) {
      errorToast("Error al eliminar el usuario.");
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists("usuarios")) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={"Usuarios del sistema"}
          icon={currentView.icon}
        />
        <UserActions />
      </HeaderTableWrapper>
      <UserTable
        isLoading={isLoading}
        columns={userColumns({
          onDelete: setDeleteId,
          onManageSedes: setSelectedUser,
        })}
        data={data?.data || []}
      >
        <UserOptions
          search={search}
          setSearch={setSearch}
          role={role}
          setRole={setRole}
        />
      </UserTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {selectedUser && (
        <UserSedesSheet
          open={true}
          onClose={() => setSelectedUser(null)}
          userId={selectedUser.id}
          userName={selectedUser.name}
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

"use client";

import { notFound } from "next/navigation";
import { DEFAULT_PER_PAGE } from "@/src/core/core.constants";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import PageSkeleton from "@/src/shared/components/PageSkeleton";
import { useEffect, useState } from "react";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";
import TitleComponent from "@/src/shared/components/TitleComponent";
import DataTablePagination from "@/src/shared/components/DataTablePagination";
import { useUserSeriesAssignment } from "@/src/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.hook";
import UserSeriesAssignmentActions from "@/src/features/ap/configuraciones/maestros-general/asignar-serie-usuario/components/UserSeriesAssignmentActions";
import UserSeriesAssignmentTable from "@/src/features/ap/configuraciones/maestros-general/asignar-serie-usuario/components/UserSeriesAssignmentTable";
import { userSeriesAssignmentColumns } from "@/src/features/ap/configuraciones/maestros-general/asignar-serie-usuario/components/UserSeriesAssignmentColumns";
import UserSeriesAssignmentOptions from "@/src/features/ap/configuraciones/maestros-general/asignar-serie-usuario/components/UserSeriesAssignmentOptions";
import { USER_SERIES_ASSIGNMENT } from "@/src/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.constants";
import { useModulePermissions } from "@/src/shared/hooks/useModulePermissions";

export default function UserSeriesAssignmentPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const { ROUTE } = USER_SERIES_ASSIGNMENT;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const { data, isLoading } = useUserSeriesAssignment({
    page,
    search,
    per_page,
  });

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
        <UserSeriesAssignmentActions permissions={permissions} />
      </HeaderTableWrapper>
      <UserSeriesAssignmentTable
        isLoading={isLoading}
        columns={userSeriesAssignmentColumns({ permissions })}
        data={data?.data || []}
      >
        <UserSeriesAssignmentOptions search={search} setSearch={setSearch} />
      </UserSeriesAssignmentTable>

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

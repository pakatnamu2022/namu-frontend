"use client";

import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useUserSeriesAssignment } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.hook";
import UserSeriesAssignmentActions from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/components/UserSeriesAssignmentActions";
import UserSeriesAssignmentTable from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/components/UserSeriesAssignmentTable";
import { userSeriesAssignmentColumns } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/components/UserSeriesAssignmentColumns";
import UserSeriesAssignmentOptions from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/components/UserSeriesAssignmentOptions";
import { USER_SERIES_ASSIGNMENT } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.constants";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import NotFound from "@/app/not-found";

export default function UserSeriesAssignmentPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const { ROUTE } = USER_SERIES_ASSIGNMENT;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [search]);

  const { data, isLoading } = useUserSeriesAssignment({
    page,
    search,
    per_page,
  });

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
        <UserSeriesAssignmentActions permissions={permissions} />
      </HeaderTableWrapper>
      <UserSeriesAssignmentTable
        isLoading={isLoading}
        columns={userSeriesAssignmentColumns({ permissions, navigate })}
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

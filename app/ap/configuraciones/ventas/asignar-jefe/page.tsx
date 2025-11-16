"use client";

import { notFound } from "next/navigation";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import PageSkeleton from "@/src/shared/components/PageSkeleton";
import TitleComponent from "@/src/shared/components/TitleComponent";
import DataTablePagination from "@/src/shared/components/DataTablePagination";
import { DEFAULT_PER_PAGE, MONTHS } from "@/src/core/core.constants";
import { useAssignmentLeadership } from "@/src/features/ap/configuraciones/ventas/asignar-jefe/lib/assignmentLeadership.hook";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";
import AssignmentLeadershipActions from "@/src/features/ap/configuraciones/ventas/asignar-jefe/components/AssignmentLeadershipActions";
import AssignmentLeadershipTable from "@/src/features/ap/configuraciones/ventas/asignar-jefe/components/AssignmentLeadershipTable";
import { assignmentLeadershipColumns } from "@/src/features/ap/configuraciones/ventas/asignar-jefe/components/AssignmentLeadershipColumns";
import AssignmentLeadershipOptions from "@/src/features/ap/configuraciones/ventas/asignar-jefe/components/AssignmentLeadershipOptions";
import { ASSIGNMENT_LEADERSHIP } from "@/src/features/ap/configuraciones/ventas/asignar-jefe/lib/assignmentLeadership.constants";
import {
  errorToast,
  generateYear,
  successToast,
} from "@/src/core/core.function";
import { updateAssignmentLeadership } from "@/src/features/ap/configuraciones/ventas/asignar-jefe/lib/assignmentLeadership.actions";
import { useModulePermissions } from "@/src/shared/hooks/useModulePermissions";

export default function AssignmentLeadershipPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const currentYear = new Date().getFullYear().toString();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const { ROUTE } = ASSIGNMENT_LEADERSHIP;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const { data, isLoading, refetch } = useAssignmentLeadership({
    page,
    per_page,
    search,
    year,
    month,
  });

  const handleToggleStatus = async (
    boss_id: number,
    status: boolean,
    year: number,
    month: number
  ) => {
    try {
      await updateAssignmentLeadership(boss_id, {
        status,
        boss_id,
        year,
        month,
      });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      errorToast("Error al actualizar el estado.", msg);
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
        <AssignmentLeadershipActions permissions={permissions} />
      </HeaderTableWrapper>
      <AssignmentLeadershipTable
        isLoading={isLoading}
        columns={assignmentLeadershipColumns({
          onToggleStatus: handleToggleStatus,
          permissions,
        })}
        data={data?.data || []}
      >
        <AssignmentLeadershipOptions
          search={search}
          setSearch={setSearch}
          year={year}
          setYear={setYear}
          years={generateYear()}
          month={month}
          setMonth={setMonth}
          months={MONTHS}
        />
      </AssignmentLeadershipTable>

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

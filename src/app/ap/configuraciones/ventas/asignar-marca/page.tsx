"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { DEFAULT_PER_PAGE, MONTHS } from "@/core/core.constants";
import { errorToast, generateYear, successToast } from "@/core/core.function";
import { useAssignBrandConsultant } from "@/features/ap/configuraciones/ventas/asignar-marca/lib/assignBrandConsultant.hook";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import AssignBrandConsultantOptions from "@/features/ap/configuraciones/ventas/asignar-marca/components/assignBrandConsultantOptions";
import { assignBrandConsultantColumns } from "@/features/ap/configuraciones/ventas/asignar-marca/components/assignBrandConsultantColumns";
import { updateAssignBrandConsultant } from "@/features/ap/configuraciones/ventas/asignar-marca/lib/assignBrandConsultant.actions";
import AssignBrandConsultantTable from "@/features/ap/configuraciones/ventas/asignar-marca/components/assignBrandConsultantTable";
import AssignBrandConsultantActions from "@/features/ap/configuraciones/ventas/asignar-marca/components/assignBrandConsultantActions";
import { ASSIGN_BRAND_CONSULTANT } from "@/features/ap/configuraciones/ventas/asignar-marca/lib/assignBrandConsultant.constants";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";

export default function AssignBrandConsultantPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const currentYear = new Date().getFullYear().toString();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const { ROUTE } = ASSIGN_BRAND_CONSULTANT;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [search]);

  const { data, isLoading, refetch } = useAssignBrandConsultant({
    page,
    search,
    per_page,
    year,
    month,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateAssignBrandConsultant(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
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
        <AssignBrandConsultantActions permissions={permissions} />
      </HeaderTableWrapper>
      <AssignBrandConsultantTable
        isLoading={isLoading}
        columns={assignBrandConsultantColumns({
          onToggleStatus: handleToggleStatus,
          permissions,
        })}
        data={data?.data || []}
      >
        <AssignBrandConsultantOptions
          search={search}
          setSearch={setSearch}
          year={year}
          setYear={setYear}
          years={generateYear()}
          month={month}
          setMonth={setMonth}
          months={MONTHS}
        />
      </AssignBrandConsultantTable>

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

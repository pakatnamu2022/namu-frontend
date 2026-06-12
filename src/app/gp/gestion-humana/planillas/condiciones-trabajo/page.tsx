"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { useWorkingConditions } from "@/features/gp/gestionhumana/planillas/working-conditions/lib/working-condition.hook";
import WorkingConditionTable from "@/features/gp/gestionhumana/planillas/working-conditions/components/WorkingConditionTable";
import { workingConditionColumns } from "@/features/gp/gestionhumana/planillas/working-conditions/components/WorkingConditionColumns";
import WorkingConditionOptions from "@/features/gp/gestionhumana/planillas/working-conditions/components/WorkingConditionOptions";
import WorkingConditionActions from "@/features/gp/gestionhumana/planillas/working-conditions/components/WorkingConditionActions";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { WORKING_CONDITION } from "@/features/gp/gestionhumana/planillas/working-conditions/lib/working-condition.constant";

export default function WorkingConditionPage() {
  const { ROUTE } = WORKING_CONDITION;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading } = useWorkingConditions({ page, per_page, search });

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) return <div>No hay</div>;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <WorkingConditionActions />
      </HeaderTableWrapper>

      <WorkingConditionTable
        isLoading={isLoading}
        columns={workingConditionColumns()}
        data={data?.data || []}
      >
        <WorkingConditionOptions search={search} setSearch={setSearch} />
      </WorkingConditionTable>

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

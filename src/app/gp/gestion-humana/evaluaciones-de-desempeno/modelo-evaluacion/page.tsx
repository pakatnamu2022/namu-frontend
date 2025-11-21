"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { useEvaluationModels } from "@/features/gp/gestionhumana/evaluaciondesempeño/modelo-evaluacion/lib/evaluationModel.hook";
import EvaluationModelActions from "@/features/gp/gestionhumana/evaluaciondesempeño/modelo-evaluacion/components/EvaluationModelActions";
import EvaluationModelTable from "@/features/gp/gestionhumana/evaluaciondesempeño/modelo-evaluacion/components/EvaluationModelTable";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";

export default function EvaluationModelPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);

  const { data, isLoading } = useEvaluationModels({
    params: {
      page,
      per_page,
    },
  });

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists("modelo-evaluacion")) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <EvaluationModelActions />
      </HeaderTableWrapper>

      <EvaluationModelTable isLoading={isLoading} data={data?.data || []} />

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

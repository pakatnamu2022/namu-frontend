"use client";

import { notFound } from "next/navigation";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import TitleComponent from "@/src/shared/components/TitleComponent";
import DataTablePagination from "@/src/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import PageSkeleton from "@/src/shared/components/PageSkeleton";
import { useMetrics } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/metricas/lib/metric.hook";
import MetricActions from "@/src/features/gp/gestionhumana/evaluaciondesempeño/metricas/components/MetricActions";
import MetricTable from "@/src/features/gp/gestionhumana/evaluaciondesempeño/metricas/components/MetricTable";
import { metricColumns } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/metricas/components/MetricColumns";
import MetricOptions from "@/src/features/gp/gestionhumana/evaluaciondesempeño/metricas/components/MetricOptions";
import { deleteMetric } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/metricas/lib/metric.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { SimpleDeleteDialog } from "@/src/shared/components/SimpleDeleteDialog";
import { DEFAULT_PER_PAGE } from "@/src/core/core.constants";
import { METRIC } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/metricas/lib/metric.constant";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";

const { MODEL } = METRIC;

export default function MetricasPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useMetrics({
    page,
    search,
    per_page,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMetric(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error) {
      errorToast(ERROR_MESSAGE(MODEL, "delete"));
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists("metricas")) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <MetricActions />
      </HeaderTableWrapper>
      <MetricTable
        isLoading={isLoading}
        columns={metricColumns({ onDelete: setDeleteId })}
        data={data?.data || []}
      >
        <MetricOptions search={search} setSearch={setSearch} />
      </MetricTable>

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
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
      />
    </div>
  );
}

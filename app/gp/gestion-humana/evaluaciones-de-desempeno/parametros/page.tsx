"use client";

import { notFound } from "next/navigation";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import TitleComponent from "@/src/shared/components/TitleComponent";
import DataTablePagination from "@/src/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import PageSkeleton from "@/src/shared/components/PageSkeleton";
import { useParameters } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/parametros/lib/parameter.hook";
import ParameterActions from "@/src/features/gp/gestionhumana/evaluaciondesempeño/parametros/components/ParameterActions";
import ParameterTable from "@/src/features/gp/gestionhumana/evaluaciondesempeño/parametros/components/ParameterTable";
import { parameterColumns } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/parametros/components/ParameterColumns";
import ParameterOptions from "@/src/features/gp/gestionhumana/evaluaciondesempeño/parametros/components/ParameterOptions";
import { SimpleDeleteDialog } from "@/src/shared/components/SimpleDeleteDialog";
import { deleteParameter } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/parametros/lib/parameter.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { PARAMETER } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/parametros/lib/parameter.constans";
import { DEFAULT_PER_PAGE } from "@/src/core/core.constants";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";

const { MODEL } = PARAMETER;

export default function ParametrosPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("objectives");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useParameters({
    page,
    search,
    type,
    per_page,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteParameter(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error) {
      errorToast(ERROR_MESSAGE(MODEL, "delete"));
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists("parametros")) notFound();
  if (!currentView) return <div>No hay</div>;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <ParameterActions />
      </HeaderTableWrapper>
      <ParameterTable
        isLoading={isLoading}
        columns={parameterColumns({ onDelete: setDeleteId })}
        data={data?.data || []}
      >
        <ParameterOptions
          search={search}
          setSearch={setSearch}
          type={type}
          setType={setType}
        />
      </ParameterTable>

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

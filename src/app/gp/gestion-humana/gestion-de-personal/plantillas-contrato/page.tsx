"use client";

import { useEffect, useState } from "react";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { notFound } from "@/shared/hooks/useNotFound";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import PageSkeleton from "@/shared/components/PageSkeleton";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { CONTRACT_TEMPLATE } from "@/features/gp/gestionhumana/gestion-de-personal/plantillas-contrato/lib/contractTemplate.constant";
import { useContractTemplates } from "@/features/gp/gestionhumana/gestion-de-personal/plantillas-contrato/lib/contractTemplate.hook";
import { deleteContractTemplate } from "@/features/gp/gestionhumana/gestion-de-personal/plantillas-contrato/lib/contractTemplate.actions";
import ContractTemplateActions from "@/features/gp/gestionhumana/gestion-de-personal/plantillas-contrato/components/ContractTemplateActions";
import ContractTemplateTable from "@/features/gp/gestionhumana/gestion-de-personal/plantillas-contrato/components/ContractTemplateTable";
import ContractTemplateOptions from "@/features/gp/gestionhumana/gestion-de-personal/plantillas-contrato/components/ContractTemplateOptions";
import { contractTemplateColumns } from "@/features/gp/gestionhumana/gestion-de-personal/plantillas-contrato/components/ContractTemplateColumns";

export default function ContractTemplatePage() {
  const { MODEL, ROUTE } = CONTRACT_TEMPLATE;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useContractTemplates({
    page,
    search,
    per_page,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteContractTemplate(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "delete"),
      );
    } finally {
      setDeleteId(null);
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
        <ContractTemplateActions />
      </HeaderTableWrapper>

      <ContractTemplateTable
        isLoading={isLoading}
        columns={contractTemplateColumns({ onDelete: setDeleteId })}
        data={data?.data || []}
      >
        <ContractTemplateOptions search={search} setSearch={setSearch} />
      </ContractTemplateTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
          description="La plantilla quedará anulada y dejará de mostrarse en el listado. ¿Deseas continuar?"
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

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
import { CONTRACT_TYPE } from "@/features/gp/gestionhumana/gestion-de-personal/tipos-contrato/lib/contractType.constant";
import { useContractTypes } from "@/features/gp/gestionhumana/gestion-de-personal/tipos-contrato/lib/contractType.hook";
import { deleteContractType } from "@/features/gp/gestionhumana/gestion-de-personal/tipos-contrato/lib/contractType.actions";
import ContractTypeActions from "@/features/gp/gestionhumana/gestion-de-personal/tipos-contrato/components/ContractTypeActions";
import ContractTypeTable from "@/features/gp/gestionhumana/gestion-de-personal/tipos-contrato/components/ContractTypeTable";
import ContractTypeOptions from "@/features/gp/gestionhumana/gestion-de-personal/tipos-contrato/components/ContractTypeOptions";
import { contractTypeColumns } from "@/features/gp/gestionhumana/gestion-de-personal/tipos-contrato/components/ContractTypeColumns";

export default function ContractTypePage() {
  const { MODEL, ROUTE } = CONTRACT_TYPE;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useContractTypes({
    page,
    search,
    per_page,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteContractType(deleteId);
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
        <ContractTypeActions />
      </HeaderTableWrapper>

      <ContractTypeTable
        isLoading={isLoading}
        columns={contractTypeColumns({ onDelete: setDeleteId })}
        data={data?.data || []}
      >
        <ContractTypeOptions search={search} setSearch={setSearch} />
      </ContractTypeTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
          description="El tipo de contrato quedará anulado y dejará de mostrarse en el listado. ¿Deseas continuar?"
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

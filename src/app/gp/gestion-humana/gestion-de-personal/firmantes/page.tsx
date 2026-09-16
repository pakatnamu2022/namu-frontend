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
import { SIGNER } from "@/features/gp/gestionhumana/gestion-de-personal/firmantes/lib/signer.constant";
import { useSigners } from "@/features/gp/gestionhumana/gestion-de-personal/firmantes/lib/signer.hook";
import { deleteSigner } from "@/features/gp/gestionhumana/gestion-de-personal/firmantes/lib/signer.actions";
import SignerActions from "@/features/gp/gestionhumana/gestion-de-personal/firmantes/components/SignerActions";
import SignerTable from "@/features/gp/gestionhumana/gestion-de-personal/firmantes/components/SignerTable";
import SignerOptions from "@/features/gp/gestionhumana/gestion-de-personal/firmantes/components/SignerOptions";
import { signerColumns } from "@/features/gp/gestionhumana/gestion-de-personal/firmantes/components/SignerColumns";

export default function SignerPage() {
  const { MODEL, ROUTE } = SIGNER;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useSigners({ page, search, per_page });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSigner(deleteId);
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
        <SignerActions />
      </HeaderTableWrapper>

      <SignerTable
        isLoading={isLoading}
        columns={signerColumns({ onDelete: setDeleteId })}
        data={data?.data || []}
      >
        <SignerOptions search={search} setSearch={setSearch} />
      </SignerTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
          description="El firmante quedará anulado y dejará de mostrarse en el listado. ¿Deseas continuar?"
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

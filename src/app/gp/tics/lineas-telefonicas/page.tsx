"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import PhoneLineTable from "@/features/gp/tics/phoneLine/components/PhoneLineTable";
import { usePhoneLines } from "@/features/gp/tics/phoneLine/lib/phoneLine.hook";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import PhoneLineOptions from "@/features/gp/tics/phoneLine/components/PhoneLineOptions";
import PhoneLineActions from "@/features/gp/tics/phoneLine/components/PhoneLineActions";
import { phoneLineColumns } from "@/features/gp/tics/phoneLine/components/PhoneLineColumns";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { deletePhoneLine } from "@/features/gp/tics/phoneLine/lib/phoneLine.actions";
import { errorToast, successToast } from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import PhoneLineImportModal from "@/features/gp/tics/phoneLine/components/PhoneLineImportModal";

export default function PhoneLinePage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = usePhoneLines({
    page,
    search,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePhoneLine(deleteId);
      await refetch();
      successToast("Línea telefónica eliminada correctamente.");
    } catch (error) {
      errorToast("Error al eliminar la línea telefónica.");
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists("lineas-telefonicas")) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <PhoneLineActions onImport={() => setImportOpen(true)} />
      </HeaderTableWrapper>
      <PhoneLineTable
        isLoading={isLoading}
        columns={phoneLineColumns({ onDelete: setDeleteId })}
        data={data?.data || []}
      >
        <PhoneLineOptions search={search} setSearch={setSearch} />
      </PhoneLineTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      <PhoneLineImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={() => refetch()}
      />

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

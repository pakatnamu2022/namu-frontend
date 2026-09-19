"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import PageSkeleton from "@/shared/components/PageSkeleton";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { DataTable } from "@/shared/components/DataTable";
import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { notFound } from "@/shared/hooks/useNotFound";
import { Button } from "@/components/ui/button";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import {
  SUBSIDY,
  SUBSIDY_TYPES,
} from "@/features/gp/gestionhumana/planillas/subsidios/lib/subsidy.constants";
import { useSubsidies } from "@/features/gp/gestionhumana/planillas/subsidios/lib/subsidy.hook";
import { deleteSubsidy } from "@/features/gp/gestionhumana/planillas/subsidios/lib/subsidy.actions";
import { SubsidyResource } from "@/features/gp/gestionhumana/planillas/subsidios/lib/subsidy.interface";
import { subsidyColumns } from "@/features/gp/gestionhumana/planillas/subsidios/components/SubsidyColumns";
import SubsidyModal from "@/features/gp/gestionhumana/planillas/subsidios/components/SubsidyModal";

const { MODEL, ROUTE } = SUBSIDY;

export default function SubsidyPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SubsidyResource | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page, type]);

  const { data, isLoading, refetch } = useSubsidies({
    page,
    per_page,
    search,
    ...(type ? { type } : {}),
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSubsidy(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message,
        ERROR_MESSAGE(MODEL, "delete"),
      );
    } finally {
      setDeleteId(null);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

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
        <ActionsWrapper>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
          </Button>
        </ActionsWrapper>
      </HeaderTableWrapper>

      <div className="border-none text-muted-foreground max-w-full">
        <DataTable
          columns={subsidyColumns({
            onEdit: (row) => {
              setEditing(row);
              setModalOpen(true);
            },
            onDelete: setDeleteId,
          })}
          data={data?.data || []}
          isLoading={isLoading}
          initialColumnVisibility={{}}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={`Buscar ${MODEL.plural}...`}
            />
            <SearchableSelect
              options={SUBSIDY_TYPES}
              value={type}
              onChange={setType}
              placeholder="Tipo"
              classNameDiv="w-52"
            />
          </div>
        </DataTable>
      </div>

      {modalOpen && (
        <SubsidyModal open={modalOpen} onClose={closeModal} subsidy={editing} />
      )}

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
          description="Esta acción no se puede deshacer. Los días y el monto dejarán de considerarse en la planilla del trabajador."
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

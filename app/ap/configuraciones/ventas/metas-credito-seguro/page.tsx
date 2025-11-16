"use client";

import { notFound } from "next/navigation";
import PageSkeleton from "@/src/shared/components/PageSkeleton";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import {
  ERROR_MESSAGE,
  errorToast,
  generateYear,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import TitleComponent from "@/src/shared/components/TitleComponent";
import { DEFAULT_PER_PAGE, MONTHS } from "@/src/core/core.constants";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";
import { SimpleDeleteDialog } from "@/src/shared/components/SimpleDeleteDialog";
import DataTablePagination from "@/src/shared/components/DataTablePagination";
import { useApSafeCreditGoal } from "@/src/features/ap/configuraciones/ventas/metas-credito-seguro/lib/apSafeCreditGoal.hook";
import { deleteApSafeCreditGoal } from "@/src/features/ap/configuraciones/ventas/metas-credito-seguro/lib/apSafeCreditGoal.actions";
import ApSafeCreditGoalActions from "@/src/features/ap/configuraciones/ventas/metas-credito-seguro/components/ApSafeCreditGoalActions";
import ApSafeCreditGoalTable from "@/src/features/ap/configuraciones/ventas/metas-credito-seguro/components/ApSafeCreditGoalTable";
import ApSafeCreditGoalOptions from "@/src/features/ap/configuraciones/ventas/metas-credito-seguro/components/ApSafeCreditGoalOptions";
import { apSafeCreditGoalColumns } from "@/src/features/ap/configuraciones/ventas/metas-credito-seguro/components/ApSafeCreditGoalColumns";
import ApSafeCreditGoalModal from "@/src/features/ap/configuraciones/ventas/metas-credito-seguro/components/ApSafeCreditGoalModal";
import { AP_SAFE_CREDIT_GOAL } from "@/src/features/ap/configuraciones/ventas/metas-credito-seguro/lib/apSafeCreditGoal.constants";
import { useModulePermissions } from "@/src/shared/hooks/useModulePermissions";

export default function ApSafeCreditGoalPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const currentYear = new Date().getFullYear().toString();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const { ROUTE, MODEL } = AP_SAFE_CREDIT_GOAL;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useApSafeCreditGoal({
    page,
    search,
    per_page,
    year,
    month,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteApSafeCreditGoal(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
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
          subtitle={"Metas de Crédito y Seguro"}
          icon={currentView.icon}
        />
        <ApSafeCreditGoalActions permissions={permissions} />
      </HeaderTableWrapper>
      <ApSafeCreditGoalTable
        isLoading={isLoading}
        columns={apSafeCreditGoalColumns({
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <ApSafeCreditGoalOptions
          search={search}
          setSearch={setSearch}
          year={year}
          setYear={setYear}
          years={generateYear()}
          month={month}
          setMonth={setMonth}
          months={MONTHS}
        />
      </ApSafeCreditGoalTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <ApSafeCreditGoalModal
          id={updateId}
          title={"Actualizar Meta"}
          open={true}
          onClose={() => {
            setUpdateId(null);
          }}
          mode="update"
        />
      )}

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

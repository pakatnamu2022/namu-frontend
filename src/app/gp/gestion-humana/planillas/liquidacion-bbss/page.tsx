"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import { useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { useLiquidacionesBbssPivot } from "@/features/gp/gestionhumana/planillas/liquidacion-bbss/lib/liquidacion-bbss.hook";
import LiquidacionBbssTable from "@/features/gp/gestionhumana/planillas/liquidacion-bbss/components/LiquidacionBbssTable";
import { liquidacionBbssPivotColumns } from "@/features/gp/gestionhumana/planillas/liquidacion-bbss/components/LiquidacionBbssPivotColumns";
import LiquidacionBbssOptions from "@/features/gp/gestionhumana/planillas/liquidacion-bbss/components/LiquidacionBbssOptions";
import LiquidacionBbssActions from "@/features/gp/gestionhumana/planillas/liquidacion-bbss/components/LiquidacionBbssActions";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { deleteLiquidacionBbss } from "@/features/gp/gestionhumana/planillas/liquidacion-bbss/lib/liquidacion-bbss.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { LIQUIDACION_BBSS } from "@/features/gp/gestionhumana/planillas/liquidacion-bbss/lib/liquidacion-bbss.constant";

export default function LiquidacionBbssPage() {
  const { MODEL, ROUTE } = LIQUIDACION_BBSS;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Sin defaults: hasta que el usuario elija empresa, año y periodo no se carga nada.
  const [year, setYear] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [periodId, setPeriodId] = useState("");

  const { data, isLoading, refetch } = useLiquidacionesBbssPivot({
    search,
    period_id: periodId,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteLiquidacionBbss(deleteId);
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
  if (!currentView) return <div>No hay</div>;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <LiquidacionBbssActions periodId={periodId} onCalculated={refetch} />
      </HeaderTableWrapper>

      <LiquidacionBbssTable
        isLoading={isLoading}
        columns={liquidacionBbssPivotColumns({
          concepts: data?.columns ?? [],
          onDelete: setDeleteId,
        })}
        data={data?.data || []}
      >
        <LiquidacionBbssOptions
          search={search}
          setSearch={setSearch}
          year={year}
          setYear={setYear}
          companyId={companyId}
          setCompanyId={setCompanyId}
          periodId={periodId}
          setPeriodId={setPeriodId}
        />
      </LiquidacionBbssTable>

      {!periodId && (
        <p className="text-sm text-muted-foreground px-1">
          Seleccione empresa, año y periodo para ver las liquidaciones.
        </p>
      )}

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

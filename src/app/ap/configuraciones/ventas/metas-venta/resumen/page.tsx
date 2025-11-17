"use client";

import { useSearchParams } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import { AP_GOAL_SELL_OUT_IN } from "@/features/ap/configuraciones/ventas/metas-venta/lib/apGoalSellOutIn.constants";
import { useApGoalSellOutInReport } from "@/features/ap/configuraciones/ventas/metas-venta/lib/apGoalSellOutIn.hook";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { ApGoalSellOutInReportTable } from "@/features/ap/configuraciones/ventas/metas-venta/components/ApGoalSellOutInReportTable";
import { ApGoalSellOutInReportData } from "@/features/ap/configuraciones/ventas/metas-venta/lib/apGoalSellOutIn.interface";
import BackButton from "@/shared/components/BackButton";
import NotFound from "@/app/not-found";

const SummaryCard = ({
  reportData,
}: {
  reportData: ApGoalSellOutInReportData;
}) => {
  const sellInTotal = reportData?.sell_in?.totals?.total || 0;
  const sellOutTotal = reportData?.sell_out?.totals?.total || 0;

  return (
    <div className="bg-white border border-gray-300 rounded-sm overflow-hidden w-fit">
      <div className="flex">
        <div className="bg-primary text-white px-6 py-1.5 text-xs font-semibold border-r border-white w-26 text-center">
          SELL IN
        </div>
        <div className="bg-secondary text-white px-6 py-1.5 text-xs font-semibold w-26 text-center">
          SELL OUT
        </div>
      </div>
      <div className="flex">
        <div className="text-center py-2 border-r border-gray-300 font-semibold text-sm w-26">
          {sellInTotal}
        </div>
        <div className="text-center py-2 font-semibold text-sm w-26">
          {sellOutTotal}
        </div>
      </div>
    </div>
  );
};

export default function ApGoalSellOutInSummaryPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const { ROUTE, ABSOLUTE_ROUTE } = AP_GOAL_SELL_OUT_IN;
  const [searchParams] = useSearchParams();

  const year = parseInt(
    searchParams.get("year") || new Date().getFullYear().toString()
  );
  const month = parseInt(
    searchParams.get("month") || (new Date().getMonth() + 1).toString()
  );

  const { data, isLoading } = useApGoalSellOutInReport({
    year: year,
    month: month,
  });

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;

  const reportData = data?.data;
  const period = data?.period;

  return (
    <div className="space-y-6">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={`Reporte de Metas - ${period?.month_name || ""} ${
            period?.year || ""
          }`}
          icon={currentView.icon}
        />
        <BackButton route={ABSOLUTE_ROUTE} name={"Resumen"} fullname={false} />
      </HeaderTableWrapper>

      {/* Información del período con resumen en la izquierda */}
      {period && (
        <div className="flex items-start gap-6 justify-end">
          {reportData && <SummaryCard reportData={reportData} />}
        </div>
      )}

      {/* Tablas del reporte */}
      <div className="space-y-6">
        {/* Tabla SELL IN */}
        {reportData?.sell_in && (
          <ApGoalSellOutInReportTable
            title="Meta Sell In Unidades"
            brands={reportData.brands}
            rows={reportData.sell_in.rows}
            totals={reportData.sell_in.totals}
            isLoading={isLoading}
            type="IN"
          />
        )}

        {/* Tabla SELL OUT */}
        {reportData?.sell_out && (
          <ApGoalSellOutInReportTable
            title="Meta Sell Out Unidades"
            brands={reportData.brands}
            rows={reportData.sell_out.rows}
            totals={reportData.sell_out.totals}
            isLoading={isLoading}
            type="OUT"
          />
        )}
      </div>

      {/* Mensaje si no hay datos */}
      {!isLoading && !reportData && (
        <div className="text-center py-8 text-gray-500">
          <p>No se encontraron datos para el período seleccionado</p>
        </div>
      )}
    </div>
  );
}

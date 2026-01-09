"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import DashboardOverviewCards from "@/features/ap/comercial/dashboard-visitas-leads/components/DashboardOverviewCards";
import DashboardSedeTable from "@/features/ap/comercial/dashboard-visitas-leads/components/DashboardSedeTable";
import DashboardChartsSection from "@/features/ap/comercial/dashboard-visitas-leads/components/DashboardChartsSection";
import DashboardUserIndicators from "@/features/ap/comercial/dashboard-visitas-leads/components/DashboardUserIndicators";
import DashboardCampaignChart from "@/features/ap/comercial/dashboard-visitas-leads/components/DashboardCampaignChart";
import DashboardFilters from "@/features/ap/comercial/dashboard-visitas-leads/components/DashboardFilters";
import {
  getIndicatorsByDateTotalRange,
  getIndicatorsBySede,
  getIndicatorsBySedeAndBrand,
  getIndicatorsByAdvisor,
  getIndicatorsByDateRange,
  getIndicatorsByUser,
  getIndicatorsByCampaign,
} from "@/features/ap/comercial/dashboard-visitas-leads/lib/dashboard.actions";
import {
  IndicatorsByDateTotalRange,
  IndicatorBySede,
  IndicatorBySedeAndBrand,
  IndicatorByAdvisor,
  IndicatorsByDateRange,
  IndicatorsByUser,
  IndicatorsByCampaign,
} from "@/features/ap/comercial/dashboard-visitas-leads/lib/dashboard.interface";
import { errorToast, successToast } from "@/core/core.function";
import TitleComponent from "@/shared/components/TitleComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import FormSkeleton from "@/shared/components/FormSkeleton";
import PageWrapper from "@/shared/components/PageWrapper";

export default function DashboardStoreVisitsPage() {
  const { isLoadingModule, currentView } = useCurrentModule();
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSedeId, setSelectedSedeId] = useState<number | null>(null);
  const [dashboardType, setDashboardType] = useState<"VISITA" | "LEADS">(
    "LEADS"
  );

  // Data states
  const [overviewData, setOverviewData] = useState<IndicatorsByDateTotalRange>({
    total_visitas: 0,
    no_atendidos: 0,
    atendidos: 0,
    descartados: 0,
    por_estado_oportunidad: {},
  });
  const [sedeData, setSedeData] = useState<IndicatorBySede[]>([]);
  const [sedeBrandData, setSedeBrandData] = useState<IndicatorBySedeAndBrand[]>(
    []
  );
  const [advisorData, setAdvisorData] = useState<IndicatorByAdvisor[]>([]);
  const [dateRangeData, setDateRangeData] = useState<IndicatorsByDateRange[]>(
    []
  );
  const [userData, setUserData] = useState<IndicatorsByUser[]>([]);
  const [campaignData, setCampaignData] = useState<IndicatorsByCampaign[]>([]);

  // Initialize dates on client side only
  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setDateFrom(firstDayOfMonth);
    setDateTo(today);
  }, []);

  const fetchDashboardData = async () => {
    if (!dateFrom || !dateTo) return;

    setIsLoading(true);
    try {
      const filters = {
        date_from: format(dateFrom, "yyyy-MM-dd"),
        date_to: format(dateTo, "yyyy-MM-dd"),
        type: dashboardType,
      };

      const [
        overviewRes,
        dateRangeRes,
        sedeRes,
        sedeBrandRes,
        advisorRes,
        userRes,
        campaignRes,
      ] = await Promise.all([
        getIndicatorsByDateTotalRange(filters),
        getIndicatorsByDateRange(filters),
        getIndicatorsBySede(filters),
        getIndicatorsBySedeAndBrand(filters),
        getIndicatorsByAdvisor(filters),
        getIndicatorsByUser(filters),
        getIndicatorsByCampaign(filters),
      ]);

      if (overviewRes.success) {
        setOverviewData(overviewRes.data);
      }

      if (dateRangeRes.success) {
        setDateRangeData(dateRangeRes.data);
      }

      if (sedeRes.success) {
        setSedeData(sedeRes.data);
      }

      if (sedeBrandRes.success) {
        setSedeBrandData(sedeBrandRes.data);
      }

      if (advisorRes.success) {
        setAdvisorData(advisorRes.data);
      }

      if (userRes.success) {
        setUserData(userRes.data);
      }

      if (campaignRes.success) {
        setCampaignData(campaignRes.data);
      }

      successToast("Dashboard actualizado correctamente");
    } catch (error: any) {
      errorToast(
        "Error al cargar los datos del dashboard",
        error.response.data?.message?.toString()
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Load data once dates are initialized or type changes
  useEffect(() => {
    if (dateFrom && dateTo) {
      fetchDashboardData();
    }
  }, [dateFrom, dateTo, dashboardType]);

  if (isLoadingModule) return <FormSkeleton />;

  return (
    <PageWrapper>
      {/* Header */}

      <TitleComponent
        title={`Dashboard de ${
          dashboardType === "LEADS" ? "Leads" : "Visitas a Tienda"
        }`}
        subtitle="Indicadores y métricas de rendimiento"
        icon={currentView?.icon}
      >
        <DashboardFilters
          dashboardType={dashboardType}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDashboardTypeChange={setDashboardType}
          onDateChange={(from, to) => {
            setDateFrom(from);
            setDateTo(to);
          }}
        />
      </TitleComponent>

      {/* Dashboard Content */}
      {isLoading ? (
        <FormSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Overview Cards */}
          <DashboardOverviewCards data={overviewData} type={dashboardType} />

          {/* Charts Section */}
          {dateRangeData.length > 0 && (
            <DashboardChartsSection data={dateRangeData} type={dashboardType} />
          )}

          {/* Indicadores de Usuario y Campaña - Solo para LEADS */}
          {dashboardType === "LEADS" &&
            (userData.length > 0 || campaignData.length > 0) && (
              <div className="space-y-6">
                {userData.length > 0 && (
                  <DashboardUserIndicators data={userData} />
                )}
                {campaignData.length > 0 && (
                  <DashboardCampaignChart data={campaignData} />
                )}
              </div>
            )}

          {/* Main Content with Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Sede Table */}
            <div
              className={cn(
                "transition-all duration-300",
                selectedSedeId ? "lg:col-span-2" : "lg:col-span-3"
              )}
            >
              <DashboardSedeTable
                data={sedeData}
                selectedSedeId={selectedSedeId}
                onSedeSelect={setSelectedSedeId}
                brandData={sedeBrandData}
                advisorData={advisorData}
              />
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

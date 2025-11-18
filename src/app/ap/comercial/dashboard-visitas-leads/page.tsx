"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCcw, ArrowLeft, CalendarIcon } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import DashboardOverviewCards from "@/features/ap/comercial/dashboard-visitas-leads/components/DashboardOverviewCards";
import DashboardSedeTable from "@/features/ap/comercial/dashboard-visitas-leads/components/DashboardSedeTable";
import DashboardChartsSection from "@/features/ap/comercial/dashboard-visitas-leads/components/DashboardChartsSection";
import DashboardUserIndicators from "@/features/ap/comercial/dashboard-visitas-leads/components/DashboardUserIndicators";
import DashboardCampaignChart from "@/features/ap/comercial/dashboard-visitas-leads/components/DashboardCampaignChart";
import DashboardActions from "@/features/ap/comercial/dashboard-visitas-leads/components/DashboardActions";
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

export default function DashboardStoreVisitsPage() {
  const router = useNavigate();

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
    } catch (error) {
      errorToast("Error al cargar los datos del dashboard");
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

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Dashboard de{" "}
              {dashboardType === "LEADS" ? "Leads" : "Visitas a Tienda"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Indicadores y métricas de rendimiento
            </p>
          </div>
        </div>
        <DashboardActions
          dateFrom={dateFrom}
          dateTo={dateTo}
          dashboardType={dashboardType}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            {/* Type ButtonGroup */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Tipo de Dashboard</label>
              <ButtonGroup>
                <Button
                  variant={dashboardType === "LEADS" ? "default" : "outline"}
                  onClick={() => setDashboardType("LEADS")}
                >
                  Leads
                </Button>
                <Button
                  variant={dashboardType === "VISITA" ? "default" : "outline"}
                  onClick={() => setDashboardType("VISITA")}
                >
                  Visitas
                </Button>
              </ButtonGroup>
            </div>

            {/* Date Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Fecha Desde */}
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Fecha Desde
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "PPP", { locale: es }) : "Selecciona fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      disabled={(date) => dateTo ? date > dateTo : false}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Fecha Hasta */}
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Fecha Hasta
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "PPP", { locale: es }) : "Selecciona fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      disabled={(date) => dateFrom ? date < dateFrom : false}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCcw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
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
    </div>
  );
}

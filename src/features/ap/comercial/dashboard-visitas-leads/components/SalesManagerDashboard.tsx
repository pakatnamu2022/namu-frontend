"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { getSalesManagerStats } from "../lib/dashboard.actions";
import {
  SalesManagerStatsResponse,
  SalesManagerFilters,
} from "../lib/dashboard.interface";
import SalesManagerStatsCards from "./SalesManagerStatsCards";
import SalesManagerAdvisorTable from "./SalesManagerAdvisorTable";
import SalesManagerDetailsSheet from "./SalesManagerDetailsSheet";
import { DateRangePickerFormField } from "@/shared/components/DateRangePickerFormField";

// Obtener el primer y último día del mes pasado
const getLastMonthRange = () => {
  const lastMonth = subMonths(new Date(), 1);
  return {
    firstDay: startOfMonth(lastMonth),
    lastDay: endOfMonth(lastMonth),
  };
};

interface DashboardFormValues {
  date_from: string;
  date_to: string;
  type: "VISITA" | "LEADS";
}

export default function SalesManagerDashboard() {
  const lastMonthRange = getLastMonthRange();
  const [statsData, setStatsData] = useState<SalesManagerStatsResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<number | null>(
    null
  );
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);

  const form = useForm<DashboardFormValues>({
    defaultValues: {
      date_from: format(lastMonthRange.firstDay, "yyyy-MM-dd"),
      date_to: format(lastMonthRange.lastDay, "yyyy-MM-dd"),
      type: "LEADS",
    },
  });

  // Cargar datos automáticamente al montar el componente
  useEffect(() => {
    loadStats(form.getValues());
  }, []);

  const loadStats = async (values: DashboardFormValues) => {
    setIsLoading(true);
    try {
      const filters: SalesManagerFilters = {
        date_from: values.date_from,
        date_to: values.date_to,
        type: values.type,
      };

      const response = await getSalesManagerStats(filters);
      setStatsData(response);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdvisorClick = (workerId: number) => {
    setSelectedAdvisorId(workerId);
    setShowDetailsSheet(true);
  };

  const onSubmit = (values: DashboardFormValues) => {
    loadStats(values);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard de Gerencia de Ventas
        </h1>
        {statsData && (
          <p className="text-muted-foreground">
            {statsData.data.manager_info.boss_name} •{" "}
            {statsData.data.manager_info.boss_position} •{" "}
            {format(new Date(statsData.period.start_date), "dd/MM/yyyy")} -{" "}
            {format(new Date(statsData.period.end_date), "dd/MM/yyyy")}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="bg-muted/50 rounded-lg p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DateRangePickerFormField
                control={form.control}
                nameFrom="date_from"
                nameTo="date_to"
                label="Rango de Fechas"
                placeholder="Selecciona un rango"
                required
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="VISITA">Visitas</SelectItem>
                        <SelectItem value="LEADS">Leads</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div className="flex items-end">
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Cargando..." : "Consultar"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>

      {/* Stats Overview */}
      {statsData && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Asesores</p>
              <p className="text-3xl font-bold">
                {statsData.data.team_totals.total_advisors}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Visitas</p>
              <p className="text-3xl font-bold">
                {statsData.data.team_totals.total_visits}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Atendidos</p>
              <p className="text-3xl font-bold text-green-600">
                {statsData.data.team_totals.attended}
              </p>
              <p className="text-xs text-muted-foreground">
                {statsData.data.team_totals.attention_percentage.toFixed(1)}%
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">No Atendidos</p>
              <p className="text-3xl font-bold text-yellow-600">
                {statsData.data.team_totals.not_attended}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Descartados</p>
              <p className="text-3xl font-bold text-red-600">
                {statsData.data.team_totals.discarded}
              </p>
            </div>
          </div>

          {/* Charts and Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Advisors Table - Takes 2 columns */}
            <div className="lg:col-span-2">
              <SalesManagerAdvisorTable
                advisors={statsData.data.by_advisor}
                onAdvisorClick={handleAdvisorClick}
              />
            </div>

            {/* Charts - Takes 1 column */}
            <div className="space-y-6">
              <SalesManagerStatsCards
                teamTotals={statsData.data.team_totals}
              />
            </div>
          </div>
        </>
      )}

      {/* Details Sheet */}
      {showDetailsSheet && (
        <SalesManagerDetailsSheet
          open={showDetailsSheet}
          onOpenChange={setShowDetailsSheet}
          filters={{
            date_from: form.getValues("date_from"),
            date_to: form.getValues("date_to"),
            type: form.getValues("type"),
            worker_id: selectedAdvisorId,
          }}
        />
      )}
    </div>
  );
}

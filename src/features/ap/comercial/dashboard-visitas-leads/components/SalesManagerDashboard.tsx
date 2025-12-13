"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllWorkers } from "@/features/gp/gestionhumana/personal/trabajadores/lib/worker.hook";

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
  boss_id?: number | null;
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
      boss_id: null,
    },
  });

  const { data: bosses = [] } = useAllWorkers();

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
        boss_id: values.boss_id,
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
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Resumen Gerencial
          </h1>
          {statsData && (
            <p className="text-sm text-muted-foreground mt-1">
              {statsData.data.manager_info.boss_name} •{" "}
              {statsData.data.manager_info.boss_position}
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-end gap-3">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex items-end gap-3"
            >
              <FormSelect
                options={bosses.map((boss) => ({
                  label: boss.name,
                  value: boss.id.toString(),
                }))}
                control={form.control}
                name="boss_id"
                placeholder="Jefe"
                
              />

              <DateRangePickerFormField
                control={form.control}
                nameFrom="date_from"
                nameTo="date_to"
                label="Período"
                placeholder="Selecciona rango"
                required
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Tipo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-[120px] h-9">
                          <SelectValue placeholder="Tipo" />
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

              <Button
                type="submit"
                disabled={isLoading}
                size="sm"
                className="h-9"
              >
                {isLoading ? "Cargando..." : "Aplicar"}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      {/* Stats Overview */}
      {isLoading && !statsData ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        statsData && (
          <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Asesores
                    </p>
                    <p className="text-3xl font-bold">
                      {statsData.data.team_totals.total_advisors}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Total{" "}
                      {form.getValues("type") === "VISITA"
                        ? "Visitas"
                        : "Leads"}
                    </p>
                    <p className="text-3xl font-bold">
                      {statsData.data.team_totals.total_visits}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Atendidos
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {statsData.data.team_totals.attended}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {statsData.data.team_totals.attention_percentage.toFixed(
                        1
                      )}
                      % del total
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      No Atendidos
                    </p>
                    <p className="text-3xl font-bold text-amber-600">
                      {statsData.data.team_totals.not_attended}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Descartados
                    </p>
                    <p className="text-3xl font-bold text-red-600">
                      {statsData.data.team_totals.discarded}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Advisors Table */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Rendimiento por Asesor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SalesManagerAdvisorTable
                      advisors={statsData.data.by_advisor}
                      onAdvisorClick={handleAdvisorClick}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="space-y-6">
                <SalesManagerStatsCards
                  teamTotals={statsData.data.team_totals}
                />
              </div>
            </div>
          </>
        )
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

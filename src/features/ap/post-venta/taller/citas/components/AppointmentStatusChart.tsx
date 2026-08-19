import { InteractivePieChart } from "@/shared/charts/InteractivePieChart";
import { ChartConfig } from "@/components/ui/chart";
import { CalendarAppointmentsStatistics } from "../lib/appointmentPlanning.interface";

interface AppointmentStatusChartProps {
  statistics: CalendarAppointmentsStatistics;
  onActiveStatusChange?: (status: "tomadas" | "pendientes") => void;
}

const config: ChartConfig = {
  tomadas: { label: "Tomadas", color: "var(--primary)" },
  pendientes: { label: "Pendientes", color: "var(--chart-3)" },
};

export default function AppointmentStatusChart({
  statistics,
  onActiveStatusChange,
}: AppointmentStatusChartProps) {
  const data = [
    {
      name: "tomadas",
      value: statistics.total_taken,
      fill: "var(--primary)",
    },
    {
      name: "pendientes",
      value: statistics.total_not_taken,
      fill: "var(--chart-3)",
    },
  ];

  return (
    <InteractivePieChart
      id="appointment-status-chart"
      config={config}
      data={data}
      title="Estado de Citas"
      subtitle="Tomadas vs. pendientes del período"
      valueLabel="Citas"
      showLegend
      showPercentageInLegend
      showSelectionFooter
      onActiveItemChange={
        onActiveStatusChange
          ? (name) => onActiveStatusChange(name as "tomadas" | "pendientes")
          : undefined
      }
    />
  );
}

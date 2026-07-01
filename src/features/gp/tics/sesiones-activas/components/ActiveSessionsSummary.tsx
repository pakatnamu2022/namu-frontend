import { MetricCard } from "@/shared/components/MetricCard";
import { Users, Wifi } from "lucide-react";

interface Props {
  total: number;
  online: number;
  isLoading?: boolean;
}

export default function ActiveSessionsSummary({
  total,
  online,
  isLoading,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <MetricCard
        title="Sesiones Activas Hoy"
        value={total}
        subtitle="Usuarios con token vigente hoy"
        icon={Users}
        color="blue"
        variant="outline"
        isLoading={isLoading}
      />
      <MetricCard
        title="En Línea"
        value={online}
        subtitle="Activos en los últimos 15 min"
        icon={Wifi}
        color="green"
        variant="outline"
        isLoading={isLoading}
      />
    </div>
  );
}

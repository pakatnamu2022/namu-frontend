import { BadgeVariants } from "@/components/ui/badge";
import {
  PerDiemRequestStatus,
  PerDiemSettlementStatus,
} from "./perDiemRequest.interface";
import {
  CheckCircle2,
  CircleDashed,
  Clock,
  FileCheck,
  FileText,
  Plane,
  XCircle,
} from "lucide-react";

export const statusConfig: Record<
  PerDiemRequestStatus,
  {
    label: string;
    variant: BadgeVariants;
    IconComponent: React.ComponentType<{ className?: string }>;
    iconBgColor: string;
    iconColor: string;
  }
> = {
  pending: {
    label: "Pendiente",
    variant: "gray",
    IconComponent: Clock,
    iconBgColor: "bg-gray-100 dark:bg-gray-800",
    iconColor: "text-gray-600 dark:text-gray-400",
  },
  approved: {
    label: "Aprobada",
    variant: "teal",
    IconComponent: CheckCircle2,
    iconBgColor: "bg-teal-100 dark:bg-teal-950",
    iconColor: "text-teal-600 dark:text-teal-400",
  },
  rejected: {
    label: "Rechazada",
    variant: "red",
    IconComponent: XCircle,
    iconBgColor: "bg-red-100 dark:bg-red-950",
    iconColor: "text-red-600 dark:text-red-400",
  },
  pending_settlement: {
    label: "Pendiente de Liquidación",
    variant: "indigo",
    IconComponent: FileText,
    iconBgColor: "bg-indigo-100 dark:bg-indigo-950",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
  in_progress: {
    label: "En Progreso",
    variant: "orange",
    IconComponent: Plane,
    iconBgColor: "bg-orange-100 dark:bg-orange-950",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  cancelled: {
    label: "Cancelada",
    variant: "secondary",
    IconComponent: CircleDashed,
    iconBgColor: "bg-gray-100 dark:bg-gray-800",
    iconColor: "text-gray-600 dark:text-gray-400",
  },
  settled: {
    label: "Liquidada",
    variant: "blue",
    IconComponent: FileCheck,
    iconBgColor: "bg-blue-100 dark:bg-blue-950",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
};

export const statusSettlementConfig: Record<
  PerDiemSettlementStatus,
  {
    label: string;
    variant: BadgeVariants;
    IconComponent: React.ComponentType<{ className?: string }>;
    iconBgColor: string;
    iconColor: string;
  }
> = {
  approved: {
    label: "Aprobada",
    variant: "green",
    IconComponent: Clock,
    iconBgColor: "bg-green-100 dark:bg-green-800",
    iconColor: "text-green-600 dark:text-green-400",
  },
  completed: {
    label: "Completada",
    variant: "blue",
    IconComponent: Clock,
    iconBgColor: "bg-blue-100 dark:bg-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  rejected: {
    label: "Rechazada",
    variant: "orange",
    IconComponent: Clock,
    iconBgColor: "bg-orange-100 dark:bg-orange-800",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  submitted: {
    label: "Enviada",
    variant: "indigo",
    IconComponent: Clock,
    iconBgColor: "bg-indigo-100 dark:bg-indigo-800",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
};

export const getStatusConfig = (status: PerDiemRequestStatus) => {
  return (
    statusConfig[status] || {
      label: status,
      variant: "outline" as const,
      IconComponent: Clock,
      iconBgColor: "bg-gray-100 dark:bg-gray-800",
      iconColor: "text-gray-600 dark:text-gray-400",
    }
  );
};

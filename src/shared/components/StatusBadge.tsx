import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatusVariant =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "neutral"
  | "pending"
  | "completed"
  | "canceled"
  | "active"
  | "inactive";

interface StatusBadgeProps {
  variant: StatusVariant;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  success:
    "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-300",
  error: "bg-red-100 text-red-700 hover:bg-red-200 border-red-300",
  warning:
    "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300",
  info: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300",
  neutral: "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300",
  pending: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300",
  completed:
    "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-300",
  canceled: "bg-red-100 text-red-700 hover:bg-red-200 border-red-300",
  active:
    "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300",
  inactive: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300",
};

export function StatusBadge({
  variant,
  children,
  icon,
  className,
}: StatusBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
        variantStyles[variant],
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </div>
  );
}

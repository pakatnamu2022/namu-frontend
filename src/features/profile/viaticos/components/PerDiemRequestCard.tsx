import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, MapPin, FileText, Wallet, Hotel } from "lucide-react";
import { PerDiemRequestResource } from "../lib/perDiemRequest.interface";
import { getStatusConfig } from "../lib/perDiemRequest.function";

interface PerDiemRequestCardProps {
  request: PerDiemRequestResource;
  onClick?: () => void;
}

export default function PerDiemRequestCard({
  request,
  onClick,
}: PerDiemRequestCardProps) {
  const statusConfig = getStatusConfig(request.status);

  const employeeExpenses = request.expenses
    ? request.expenses.filter((expense) => !expense.is_company_expense)
    : [];

  const totalSpentByEmployee = employeeExpenses.reduce(
    (sum, expense) => sum + expense.company_amount,
    0
  );

  const spentPercentage = (totalSpentByEmployee / request.total_budget) * 100;

  const StatusIcon = statusConfig.IconComponent;

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.01] group"
      onClick={onClick}
    >
      <CardHeader className="pb-3 space-y-2.5">
        {/* Código con ícono y Badge de Estado */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${statusConfig.iconBgColor}`}
              >
                <StatusIcon className={`w-5 h-5 ${statusConfig.iconColor}`} />
              </div>
            </div>
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
              {request.code}
            </h3>
          </div>
          <Badge
            variant={statusConfig.variant}
            className="flex items-center gap-1 shrink-0"
          >
            <StatusIcon className={`w-3 h-3`} />
            <span>{statusConfig.label}</span>
          </Badge>
        </div>

        {/* Fechas */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>
            {format(new Date(request.start_date), "dd MMM", {
              locale: es,
            })}{" "}
            -{" "}
            {format(new Date(request.end_date), "dd MMM, yyyy", {
              locale: es,
            })}
          </span>
          {request.hotel_reservation && (
            <>
              <span className="text-muted-foreground/40">•</span>
              <Hotel className="w-3.5 h-3.5 text-muted-foreground/70" />
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Destino */}
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5">
            <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">Destino</p>
            <p className="font-medium text-sm truncate">
              {request.district.name}
            </p>
          </div>
        </div>

        {/* Propósito */}
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5">
            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">Propósito</p>
            <p className="text-sm line-clamp-2 leading-snug">
              {request.purpose}
            </p>
          </div>
        </div>

        {/* Gastos con barra de progreso */}
        <div className="pt-2.5 border-t space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Gastado</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {spentPercentage.toFixed(0)}%
            </p>
          </div>

          <div className="flex items-baseline justify-between">
            <p className="font-semibold text-sm">
              S/ {request.total_spent.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              de S/ {request.total_budget.toFixed(2)}
            </p>
          </div>

          {/* Barra de progreso sutil */}
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                spentPercentage > 95
                  ? "bg-destructive"
                  : spentPercentage > 85
                  ? "bg-muted-foreground/60"
                  : "bg-muted-foreground/40"
              }`}
              style={{ width: `${Math.min(spentPercentage, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

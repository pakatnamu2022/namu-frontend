import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  footer?: string;
  icon?: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const variantTextColors = {
  default: "text-foreground",
  success: "text-green-600 dark:text-green-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
};

export function MetricCard({
  title,
  value,
  subtitle,
  footer,
  icon,
  variant = "default",
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("@container/card border-0 bg-linear-to-br from-muted/50 via-muted/30 to-background", className)}>
      <CardHeader>
        <CardDescription className="line-clamp-1">{title}</CardDescription>
        <CardTitle className={cn(
          "text-2xl font-semibold tabular-nums @[250px]/card:text-3xl",
          variantTextColors[variant]
        )}>
          {value}
        </CardTitle>
        {subtitle && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {subtitle}
          </p>
        )}
      </CardHeader>
      {footer && (
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium items-center">
            {footer}
            {icon && <span className="size-4">{icon}</span>}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

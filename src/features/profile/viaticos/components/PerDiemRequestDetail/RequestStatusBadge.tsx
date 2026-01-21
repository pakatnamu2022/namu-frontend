import { Badge } from "@/components/ui/badge";
import { statusConfig } from "../../lib/perDiemRequest.function";
import { PerDiemRequestStatus } from "../../lib/perDiemRequest.interface";

interface RequestStatusBadgeProps {
  status: PerDiemRequestStatus;
}

export default function RequestStatusBadge({
  status,
}: RequestStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    variant: "outline" as const,
    icon: null,
  };

  const { IconComponent, color, label } = config;

  return (
    <Badge color={color} className="flex! items-center gap-1 w-fit">
      {IconComponent && <IconComponent className="w-3 h-3" />}
      <p className="line-clamp-1">{label}</p>
    </Badge>
  );
}

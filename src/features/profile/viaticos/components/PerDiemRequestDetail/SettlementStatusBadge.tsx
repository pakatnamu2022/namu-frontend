import { Badge } from "@/components/ui/badge";
import { statusSettlementConfig } from "../../lib/perDiemRequest.function";
import { PerDiemSettlementStatus } from "../../lib/perDiemRequest.interface";

interface SettlementStatusBadgeProps {
  settlementStatus: PerDiemSettlementStatus;
}

export default function SettlementStatusBadge({
  settlementStatus,
}: SettlementStatusBadgeProps) {
  const config = statusSettlementConfig[settlementStatus] || {
    label: settlementStatus,
    variant: "outline" as const,
    icon: null,
  };

  const { IconComponent, variant, label } = config;

  return (
    <Badge variant={variant} className="flex! items-center gap-1 w-fit">
      {IconComponent && <IconComponent className="w-3 h-3" />}
      <p className="line-clamp-1">{label}</p>
    </Badge>
  );
}

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, User, Package } from "lucide-react";
import { OpportunityResource } from "../../oportunidades/lib/opportunities.interface";

interface OpportunityInfoCardProps {
  opportunity: OpportunityResource;
}

export const OpportunityInfoCard = ({ opportunity }: OpportunityInfoCardProps) => {
  return (
    <Card className="border-2 border-primary/20 bg-blue-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Target className="size-5 text-primary" />
          <h3 className="text-sm font-semibold text-primary">Oportunidad Asociada</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <User className="size-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Cliente</p>
              <p className="text-sm font-medium">{opportunity.client.full_name}</p>
              <p className="text-xs text-muted-foreground">{opportunity.client.num_doc}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Package className="size-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Vehículo de Interés</p>
              <p className="text-sm font-medium">
                {opportunity.family.brand} {opportunity.family.description}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Estado</p>
            <Badge variant="outline" className="mt-1">
              {opportunity.opportunity_status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

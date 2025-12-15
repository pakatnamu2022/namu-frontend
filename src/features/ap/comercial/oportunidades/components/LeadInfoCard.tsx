"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ManageLeadsResource } from "../../gestionar-leads/lib/manageLeads.interface";
import {
  Car,
  Building2,
  Calendar,
  Briefcase,
  User,
  IdCard,
  Phone,
  Mail,
  MapPin,
  UserCheck,
} from "lucide-react";
import { format } from "date-fns";

interface LeadInfoCardProps {
  lead: ManageLeadsResource;
}

const getStatusBadgeVariant = (
  status: string
): "default" | "secondary" | "destructive" | "outline" => {
  const statusLower = status?.toLowerCase();
  if (statusLower?.includes("válido") || statusLower?.includes("valido"))
    return "default";
  if (statusLower?.includes("pendiente")) return "secondary";
  if (statusLower?.includes("inválido") || statusLower?.includes("invalido"))
    return "destructive";
  return "outline";
};

export const LeadInfoCard = ({ lead }: LeadInfoCardProps) => {
  return (
    <Card className="hover:shadow-sm transition-all border-primary/10 hover:bg-blue-50/30">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header: Cliente y Documento */}
          <div className="flex items-start justify-between pb-3 border-b">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <h4 className="font-semibold text-sm">{lead.full_name}</h4>
              </div>
              <div className="flex items-center gap-2 ml-6">
                <IdCard className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {lead.num_doc}
                </span>
                {lead.status_num_doc && (
                  <Badge
                    variant={getStatusBadgeVariant(lead.status_num_doc)}
                    className="text-xs"
                  >
                    {lead.status_num_doc}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              {lead.type && (
                <Badge variant="outline" className="text-xs">
                  {lead.type}
                </Badge>
              )}
              {lead.registration_date && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {format(new Date(lead.registration_date), "dd/MM/yyyy")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Vehículo de Interés */}
          {lead.model && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">
                  {lead.vehicle_brand} {lead.model}
                </span>
              </div>
              <div className="ml-6 space-y-1">
                {lead.version && (
                  <p className="text-xs text-muted-foreground">
                    {lead.version}
                  </p>
                )}
                {lead.campaign && (
                  <Badge variant="secondary" className="text-xs">
                    {lead.campaign}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Contacto */}
          {(lead.phone || lead.email) && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {lead.phone && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{lead.phone}</span>
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span>{lead.email}</span>
                </div>
              )}
            </div>
          )}

          {/* Información adicional */}
          <div className="flex items-center justify-between pt-2 border-t text-xs">
            <div className="flex flex-col gap-1">
              {lead.income_sector && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Briefcase className="h-3 w-3" />
                  <span>{lead.income_sector}</span>
                </div>
              )}
              {lead.worker && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <UserCheck className="h-3 w-3" />
                  <span>{lead.worker}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              {lead.sede && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{lead.sede}</span>
                </div>
              )}
              {lead.district && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  <span>{lead.district}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

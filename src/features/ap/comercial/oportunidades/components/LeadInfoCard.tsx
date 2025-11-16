"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ManageLeadsResource } from "../../gestionar-leads/lib/manageLeads.interface";
import { Car, Building2, Calendar, Tag, Briefcase } from "lucide-react";

interface LeadInfoCardProps {
  lead: ManageLeadsResource;
}

export const LeadInfoCard = ({ lead }: LeadInfoCardProps) => {
  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-primary">
          Información del Lead
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vehicle Information */}
          {lead.model && (
            <div className="flex items-start gap-2">
              <Car className="size-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">
                  Vehículo de Interés
                </p>
                <p className="text-sm font-medium">
                  {lead.vehicle_brand} {lead.model}{" "}
                  {lead.version && `- ${lead.version}`}
                </p>
              </div>
            </div>
          )}

          {/* Campaign */}
          {lead.campaign && (
            <div className="flex items-start gap-2">
              <Tag className="size-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Campaña</p>
                <p className="text-sm font-medium">{lead.campaign}</p>
              </div>
            </div>
          )}

          {/* Registration Date */}
          {lead.registration_date && (
            <div className="flex items-start gap-2">
              <Calendar className="size-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">
                  Fecha de Registro
                </p>
                <p className="text-sm font-medium">
                  {new Date(lead.registration_date).toLocaleDateString(
                    "es-PE",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Lead Type */}
          {lead.type && (
            <div className="flex items-start gap-2">
              <Briefcase className="size-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Tipo de Lead</p>
                <p className="text-sm font-medium">{lead.type}</p>
              </div>
            </div>
          )}

          {/* Income Sector */}
          {lead.income_sector && (
            <div className="flex items-start gap-2">
              <Building2 className="size-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">
                  Sector de Ingreso
                </p>
                <p className="text-sm font-medium">{lead.income_sector}</p>
              </div>
            </div>
          )}

          {/* Sede */}
          {lead.sede && (
            <div className="flex items-start gap-2">
              <Building2 className="size-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Sede</p>
                <p className="text-sm font-medium">{lead.sede}</p>
              </div>
            </div>
          )}

          {/* District */}
          {lead.district && (
            <div className="flex items-start gap-2">
              <Building2 className="size-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Distrito</p>
                <p className="text-sm font-medium">{lead.district}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

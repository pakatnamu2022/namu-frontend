"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Building2,
  Loader2,
  AlertCircle,
  BriefcaseBusiness,
  User,
  Car,
  Tag,
  Calendar,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OpportunityResource } from "../../oportunidades/lib/opportunities.interface";
import { getAllOpportunitiesByCustomer } from "../lib/customers.actions";
import {
  BG_OPPORTUNITY,
  BG_TEXT_OPPORTUNITY,
  TEXT_OPPORTUNITY,
  BORDER_OPPORTUNITY,
  OPPORTUNITIES,
} from "../../oportunidades/lib/opportunities.constants";

interface Props {
  customerId: number;
  loading?: boolean;
}

export default function OpportunitiesSheet({
  customerId,
  loading = false,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [opportunities, setOpportunities] = useState<OpportunityResource[]>([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { ABSOLUTE_ROUTE } = OPPORTUNITIES;

  // Get client name from first opportunity
  const clientName = opportunities.length > 0 ? opportunities[0].client.full_name : "";

  const loadOpportunities = async () => {
    setLoadingOpportunities(true);
    setError(null);
    try {
      const data = await getAllOpportunitiesByCustomer(customerId);
      setOpportunities(data);
    } catch (err) {
      setError("Error al cargar las oportunidades");
    } finally {
      setLoadingOpportunities(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadOpportunities();
    }
  }, [open, customerId]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="size-7"
          disabled={loading}
          tooltip="Oportunidades"
        >
          <BriefcaseBusiness
            className={cn("size-4", { "animate-spin": loading })}
          />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              <span>Oportunidades</span>
            </div>
            {clientName && (
              <div className="flex items-center gap-2 text-base font-medium text-gray-700">
                <User className="size-4" />
                <span>{clientName}</span>
              </div>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Loading State */}
          {loadingOpportunities && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="size-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">
                  Cargando oportunidades...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <AlertCircle className="size-8 mx-auto text-red-500" />
                <p className="text-sm text-red-600">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadOpportunities}
                  className="mt-2"
                >
                  Reintentar
                </Button>
              </div>
            </div>
          )}

          {/* Success State - Opportunities List */}
          {!loadingOpportunities && !error && opportunities.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 hover:bg-green-200"
                >
                  {opportunities.length}{" "}
                  {opportunities.length === 1 ? "oportunidad" : "oportunidades"}
                </Badge>
              </div>

              <Separator />

              <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2">
                {opportunities.map((opportunity) => {
                  const bgColor = BG_OPPORTUNITY[opportunity.opportunity_status] || BG_OPPORTUNITY["FRIO"];
                  const bgTextColor = BG_TEXT_OPPORTUNITY[opportunity.opportunity_status] || BG_TEXT_OPPORTUNITY["FRIO"];
                  const textColor = TEXT_OPPORTUNITY[opportunity.opportunity_status] || TEXT_OPPORTUNITY["FRIO"];
                  const borderColor = BORDER_OPPORTUNITY[opportunity.opportunity_status] || BORDER_OPPORTUNITY["FRIO"];

                  const isClosed = opportunity.is_closed;
                  const canClick = isClosed;

                  const handleCardClick = () => {
                    if (canClick) {
                      router.push(`${ABSOLUTE_ROUTE}/${opportunity.id}`);
                    }
                  };

                  return (
                    <Card
                      key={opportunity.id}
                      onClick={handleCardClick}
                      className={cn(
                        "relative transition-all duration-200",
                        bgColor,
                        borderColor,
                        "border-2",
                        canClick ? "cursor-pointer hover:shadow-md" : "cursor-not-allowed opacity-60"
                      )}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Car className={cn("size-5 flex-shrink-0", textColor)} />
                            <span className="font-semibold truncate">
                              {opportunity.family.brand} {opportunity.family.description}
                            </span>
                          </div>
                          <Badge className={cn("shrink-0", bgTextColor, textColor)}>
                            {opportunity.opportunity_status}
                          </Badge>
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <div className="grid gap-3">
                          {/* Advisor/Worker */}
                          <div className="flex items-start gap-3">
                            <BriefcaseBusiness className={cn("size-4 mt-0.5 flex-shrink-0", textColor)} />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                Asesor Asignado
                              </p>
                              <p className="text-sm text-gray-600 break-words">
                                {opportunity.worker.name}
                              </p>
                            </div>
                          </div>

                          {/* Opportunity Type */}
                          <div className="flex items-start gap-3">
                            <Tag className={cn("size-4 mt-0.5 flex-shrink-0", textColor)} />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                Tipo de Oportunidad
                              </p>
                              <p className="text-sm text-gray-600 break-words">
                                {opportunity.opportunity_type}
                              </p>
                            </div>
                          </div>

                          {/* Client Status */}
                          <div className="flex items-start gap-3">
                            <Calendar className={cn("size-4 mt-0.5 flex-shrink-0", textColor)} />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                Estado del Cliente
                              </p>
                              <p className="text-sm text-gray-600 break-words">
                                {opportunity.client_status}
                              </p>
                            </div>
                          </div>

                          {/* Actions Count */}
                          {opportunity.actions && opportunity.actions.length > 0 && (
                            <div className={cn("rounded-lg p-3 mt-2", bgTextColor)}>
                              <p className="text-sm font-medium">
                                <span className={cn("font-bold", textColor)}>
                                  {opportunity.actions.length}
                                </span>{" "}
                                {opportunity.actions.length === 1 ? "acción registrada" : "acciones registradas"}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loadingOpportunities && !error && opportunities.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Building2 className="size-12 mx-auto text-gray-400" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    No hay oportunidades
                  </h3>
                  <p className="text-sm text-gray-500">
                    Este cliente no tiene oportunidades registrados
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <SheetFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading || loadingOpportunities}
          >
            Cerrar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

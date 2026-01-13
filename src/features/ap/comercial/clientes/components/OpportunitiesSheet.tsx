"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Building2,
  Loader2,
  AlertCircle,
  BriefcaseBusiness,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OpportunityResource } from "../../oportunidades/lib/opportunities.interface";
import { getAllOpportunitiesByCustomer } from "../lib/customers.actions";
import { OPPORTUNITIES } from "../../oportunidades/lib/opportunities.constants";
import { errorToast } from "@/core/core.function";
import { OpportunityInfoCard } from "../../solicitudes-cotizaciones/components/OpportunityInfoCard";
import GeneralSheet from "@/shared/components/GeneralSheet";

interface Props {
  customerId: number;
  loading?: boolean;
}

export default function OpportunitiesSheet({
  customerId,
  loading = false,
}: Props) {
  const router = useNavigate();
  const [open, setOpen] = useState(false);
  const [opportunities, setOpportunities] = useState<OpportunityResource[]>([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { ABSOLUTE_ROUTE } = OPPORTUNITIES;

  // Get client name from first opportunity
  const clientName =
    opportunities.length > 0 ? opportunities[0].client.full_name : "";

  const loadOpportunities = async () => {
    setLoadingOpportunities(true);
    setError(null);
    try {
      const data = await getAllOpportunitiesByCustomer(customerId);
      setOpportunities(data);
    } catch (error: any) {
      errorToast(
        "Error al cargar las oportunidades",
        error.response?.data?.message
      );
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
    <>
      <Button
        size="icon"
        variant="outline"
        className="size-7"
        disabled={loading}
        tooltip="Oportunidades"
        onClick={() => setOpen(true)}
      >
        <BriefcaseBusiness
          className={cn("size-4", { "animate-spin": loading })}
        />
      </Button>

      <GeneralSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Oportunidades"
        subtitle={clientName}
        icon="BriefcaseBusiness"
        size="2xl"
      >
        <div className="space-y-6">
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

              <div className="grid gap-4 max-h-[400px] overflow-y-auto p-2">
                {opportunities.map((opportunity) => {
                  const isClosed = opportunity.is_closed;
                  const canClick = isClosed;

                  const handleCardClick = () => {
                    if (canClick) {
                      router(`${ABSOLUTE_ROUTE}/${opportunity.id}`);
                    }
                  };

                  return (
                    <div
                      key={opportunity.id}
                      onClick={handleCardClick}
                      className={cn(
                        "transition-all duration-200",
                        canClick
                          ? "cursor-pointer hover:shadow-lg"
                          : "cursor-not-allowed opacity-60"
                      )}
                    >
                      <OpportunityInfoCard opportunity={opportunity} />
                    </div>
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
      </GeneralSheet>
    </>
  );
}

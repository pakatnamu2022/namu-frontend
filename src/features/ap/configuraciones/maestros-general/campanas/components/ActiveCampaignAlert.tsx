"use client";

import { useState } from "react";
import { AlertTriangle, Megaphone } from "lucide-react";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { useActiveCampaign } from "../lib/campaign.hook";
import { DISCOUNT_TYPE_OPTIONS } from "../lib/campaign.constants";

interface ActiveCampaignAlertProps {
  areaId: number;
  className?: string;
}

/**
 * Alerta compacta que informa si hay una campaña activa para un área
 * (ap_master.area_id). Si existe, muestra un aviso informativo con el
 * mensaje de la API y un botón para ver el detalle completo en un
 * GeneralModal. Si no hay campaña activa, muestra una alerta de
 * advertencia con el mensaje devuelto por el backend (la API responde
 * 200 con data: null en ese caso).
 */
export function ActiveCampaignAlert({
  areaId,
  className,
}: ActiveCampaignAlertProps) {
  const [showDetails, setShowDetails] = useState(false);
  const {
    data: activeCampaign,
    message,
    isLoading,
  } = useActiveCampaign({ area_id: areaId });

  if (isLoading) return null;

  if (!activeCampaign) {
    return (
      <Alert variant="warning" className={className}>
        <AlertTriangle />
        <AlertTitle>Sin campaña activa</AlertTitle>
        <AlertDescription>
          {message || "No hay una campaña activa para esta área."}
        </AlertDescription>
      </Alert>
    );
  }

  const discountOptionLabel = DISCOUNT_TYPE_OPTIONS.find(
    (o) => o.value === activeCampaign.discount_type,
  )?.label;
  const discountLabel =
    typeof discountOptionLabel === "string"
      ? discountOptionLabel
      : activeCampaign.discount_type;

  const discountText = `${activeCampaign.discount_value}${
    activeCampaign.discount_type === "percentage" ? "%" : ""
  }`;

  return (
    <>
      <Alert variant="info" className={className}>
        <Megaphone />
        <AlertTitle>Campaña activa: {activeCampaign.name}</AlertTitle>
        <AlertDescription>
          {activeCampaign.description ||
            `Descuento de ${discountText} (${discountLabel}) vigente para esta área.`}
        </AlertDescription>
        <AlertAction>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowDetails(true)}
          >
            Ver detalles
          </Button>
        </AlertAction>
      </Alert>

      <GeneralModal
        open={showDetails}
        onClose={() => setShowDetails(false)}
        title={activeCampaign.name}
        subtitle={activeCampaign.code}
        icon="Megaphone"
      >
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Área</p>
              <p className="font-medium">
                {activeCampaign.area?.description ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Código</p>
              <p className="font-medium">{activeCampaign.code}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Vigencia</p>
              <p className="font-medium">
                {activeCampaign.start_date} - {activeCampaign.end_date}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Descuento</p>
              <p className="font-medium">
                {discountText} ({discountLabel})
              </p>
            </div>
          </div>
          {activeCampaign.description && (
            <div>
              <p className="text-xs text-muted-foreground">Descripción</p>
              <p>{activeCampaign.description}</p>
            </div>
          )}
        </div>
      </GeneralModal>
    </>
  );
}

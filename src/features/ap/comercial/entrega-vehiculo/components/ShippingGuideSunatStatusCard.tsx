"use client";

import { ExternalLink, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { ShipmentsReceptionsResource } from "../../envios-recepciones/lib/shipmentsReceptions.interface";

interface ShippingGuideSunatStatusCardProps {
  shippingGuide: ShipmentsReceptionsResource;
}

export function ShippingGuideSunatStatusCard({
  shippingGuide,
}: ShippingGuideSunatStatusCardProps) {
  return (
    <GroupFormSection
      title="Estado SUNAT"
      icon={Shield}
      color="slate"
      cols={{ sm: 1, md: 2, lg: 2 }}
    >
      <div>
        <p className="text-xs text-muted-foreground">Estado SUNAT</p>
        <Badge
          color={shippingGuide.aceptada_por_sunat ? "default" : "secondary"}
          className="mt-0.5"
        >
          {shippingGuide.aceptada_por_sunat ? "Aceptada" : "Pendiente"}
        </Badge>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Registrado en SUNAT</p>
        <Badge
          color={shippingGuide.is_sunat_registered ? "default" : "secondary"}
          className="mt-0.5"
        >
          {shippingGuide.is_sunat_registered ? "Sí" : "No"}
        </Badge>
      </div>
      {shippingGuide.sent_at && (
        <div>
          <p className="text-xs text-muted-foreground">Fecha de Envío</p>
          <p className="text-sm font-medium">
            {new Date(shippingGuide.sent_at).toLocaleString("es-PE", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      )}
      {shippingGuide.notes && (
        <div className="md:col-span-2">
          <p className="text-xs text-muted-foreground">Notas</p>
          <p className="text-sm">{shippingGuide.notes}</p>
        </div>
      )}

      {/* Documentos electrónicos */}
      {(shippingGuide.enlace_del_pdf ||
        shippingGuide.enlace_del_xml ||
        shippingGuide.enlace_del_cdr) && (
        <div className="md:col-span-2 pt-1">
          <p className="text-xs text-muted-foreground mb-2">
            Documentos Electrónicos
          </p>
          <div className="flex flex-wrap gap-2">
            {shippingGuide.enlace_del_pdf && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(shippingGuide.enlace_del_pdf!, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver PDF
              </Button>
            )}
            {shippingGuide.enlace_del_xml && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(shippingGuide.enlace_del_xml!, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver XML
              </Button>
            )}
            {shippingGuide.enlace_del_cdr && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(shippingGuide.enlace_del_cdr!, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver CDR
              </Button>
            )}
          </div>
        </div>
      )}
    </GroupFormSection>
  );
}

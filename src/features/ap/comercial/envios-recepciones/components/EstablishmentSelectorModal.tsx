"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EstablishmentsResource } from "../../establecimientos/lib/establishments.interface";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { useAllEstablishments } from "../../establecimientos/lib/establishments.hook";

interface EstablishmentSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessPartnerId: number | null;
  businessPartnerName: string;
  onSelectEstablishment: (establishment: EstablishmentsResource) => void;
  sede_id?: string | null;
}

export const EstablishmentSelectorModal = ({
  open,
  onOpenChange,
  businessPartnerId,
  businessPartnerName,
  onSelectEstablishment,
  sede_id,
}: EstablishmentSelectorModalProps) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: establishments = [], isLoading } = useAllEstablishments({
    business_partner_id: businessPartnerId,
    status: STATUS_ACTIVE,
  });

  // Auto-seleccionar establecimientos si sede_id coincide
  useEffect(() => {
    if (sede_id && sede_id !== "" && establishments.length > 0 && !isLoading) {
      const matchingEstablishment = establishments.find((est) => {
        const estSedeIdStr = String(est.sede_id);
        const sedeIdStr = String(sede_id);
        return estSedeIdStr === sedeIdStr;
      });

      if (matchingEstablishment) {
        // Si encuentra coincidencia, selecciona automáticamente
        handleSelect(matchingEstablishment);
      }
    }
  }, [sede_id, establishments, isLoading]);

  const handleSelect = (establishment: EstablishmentsResource) => {
    setSelectedId(establishment.id);
    onSelectEstablishment(establishment);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Seleccionar Establecimiento
          </DialogTitle>
          <DialogDescription>
            Establecimientos de {businessPartnerName}
            <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {establishments.length}
            </span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[500px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : establishments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mb-2 opacity-20" />
              <p>No se encontraron establecimientos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {establishments.map((establishment) => (
                <button
                  key={establishment.id}
                  onClick={() => handleSelect(establishment)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border-2 transition-all hover:border-primary hover:shadow-md",
                    selectedId === establishment.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {establishment.code}
                        </span>
                        <span className="text-xs text-gray-500">
                          {establishment.type}
                        </span>
                      </div>
                      {establishment.description && (
                        <p className="text-sm text-gray-700">
                          {establishment.description}
                        </p>
                      )}
                      <div className="flex items-start gap-1 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
                        <span>{establishment.full_address}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

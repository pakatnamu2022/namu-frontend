"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Building2, MapPin, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { EstablishmentsResource } from "../../establecimientos/lib/establishments.interface";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { useAllEstablishments } from "../../establecimientos/lib/establishments.hook";
import { GeneralModal } from "@/shared/components/GeneralModal";

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
  const [searchQuery, setSearchQuery] = useState("");

  const { data: establishments = [], isLoading } = useAllEstablishments({
    business_partner_id: businessPartnerId,
    status: STATUS_ACTIVE,
  });

  // Filtrar establecimientos por búsqueda
  const filteredEstablishments = useMemo(() => {
    if (!searchQuery.trim()) return establishments;

    const query = searchQuery.toLowerCase();
    return establishments.filter(
      (est) =>
        est.code?.toLowerCase().includes(query) ||
        est.description?.toLowerCase().includes(query) ||
        est.full_address?.toLowerCase().includes(query) ||
        est.type?.toLowerCase().includes(query)
    );
  }, [establishments, searchQuery]);

  // Auto-seleccionar establecimiento si sede_id coincide
  useEffect(() => {
    if (sede_id && sede_id !== "" && establishments.length > 0 && !isLoading) {
      const matchingEstablishment = establishments.find((est) => {
        const estSedeIdStr = String(est.sede_id);
        const sedeIdStr = String(sede_id);
        return estSedeIdStr === sedeIdStr;
      });

      if (matchingEstablishment) {
        handleSelect(matchingEstablishment);
      }
    }
  }, [sede_id, establishments, isLoading]);

  // Limpiar búsqueda al cerrar el modal
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  const handleSelect = (establishment: EstablishmentsResource) => {
    setSelectedId(establishment.id);
    onSelectEstablishment(establishment);
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Seleccionar Establecimiento"
      subtitle={`Establecimientos de ${businessPartnerName} (${establishments.length})`}
      icon="MapPin"
      maxWidth="max-w-3xl"
    >
      <div className="flex flex-col gap-4">
        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, descripción o dirección..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-[400px]">
          <div className="pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredEstablishments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mb-2 opacity-20" />
                <p>
                  {searchQuery
                    ? "No se encontraron resultados"
                    : "No se encontraron establecimientos"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEstablishments.map((establishment) => (
                <button
                  key={establishment.id}
                  onClick={() => handleSelect(establishment)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border-2 transition-all hover:border-primary hover:shadow-md",
                    selectedId === establishment.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {establishment.code}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {establishment.type}
                        </span>
                      </div>
                      {establishment.description && (
                        <p className="text-sm text-muted-foreground">
                          {establishment.description}
                        </p>
                      )}
                      <div className="flex items-start gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>{establishment.full_address}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </GeneralModal>
  );
};

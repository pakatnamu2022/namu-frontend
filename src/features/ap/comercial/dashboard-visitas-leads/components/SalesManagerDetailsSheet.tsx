"use client";

import GeneralSheet from "@/shared/components/GeneralSheet";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { SalesManagerDetailsFilters } from "../lib/dashboard.interface";
import { useAllManageLeads } from "../../gestionar-leads/lib/manageLeads.hook";
import { LeadInfoCard } from "../../oportunidades/components/LeadInfoCard";
import { useState, useMemo } from "react";
import FormSkeleton from "@/shared/components/FormSkeleton";

interface SalesManagerDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: SalesManagerDetailsFilters;
}

export default function SalesManagerDetailsSheet({
  open,
  onOpenChange,
  filters,
}: SalesManagerDetailsSheetProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: leads = [], isLoading } = useAllManageLeads({
    ...filters,
  });

  const filteredLeads = useMemo(() => {
    if (!searchTerm.trim()) return leads;

    const searchLower = searchTerm.toLowerCase();
    return leads.filter((lead) => {
      return (
        lead.full_name?.toLowerCase().includes(searchLower) ||
        lead.num_doc?.toLowerCase().includes(searchLower) ||
        lead.phone?.toLowerCase().includes(searchLower) ||
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.vehicle_brand?.toLowerCase().includes(searchLower) ||
        lead.model?.toLowerCase().includes(searchLower)
      );
    });
  }, [leads, searchTerm]);

  return (
    <GeneralSheet
      open={open}
      onClose={() => onOpenChange(false)}
      title="Detalles de Visitas/Leads"
      subtitle="Información detallada de las visitas y leads registrados"
      icon="FileText"
      size="xl"
      side="right"
      className="overflow-y-auto"
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, documento, teléfono, email o vehículo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <FormSkeleton />
          ) : filteredLeads?.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">
                {searchTerm.trim()
                  ? "No se encontraron resultados para tu búsqueda"
                  : "No hay detalles disponibles"}
              </p>
            </div>
          ) : (
            filteredLeads.map((detail) => (
              <LeadInfoCard lead={detail} key={detail.id} />
            ))
          )}
        </div>
      </div>
    </GeneralSheet>
  );
}

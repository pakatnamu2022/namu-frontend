"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SalesManagerDetailsFilters } from "../lib/dashboard.interface";
import { useAllManageLeads } from "../../gestionar-leads/lib/manageLeads.hook";
import { LeadInfoCard } from "../../oportunidades/components/LeadInfoCard";

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
  const { data: leads = [], isLoading } = useAllManageLeads({
    params: {
      ...filters,
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-3xl overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Detalles de Visitas/Leads</SheetTitle>
          <SheetDescription>
            Información detallada de las visitas y leads registrados
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">Cargando...</p>
            </div>
          ) : leads?.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">
                No hay detalles disponibles
              </p>
            </div>
          ) : (
            leads.map((detail) => (
              <LeadInfoCard lead={detail} key={detail.id} />
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getSalesManagerDetails } from "../lib/dashboard.actions";
import {
  LeadVisitDetail,
  SalesManagerDetailsFilters,
} from "../lib/dashboard.interface";
import { format } from "date-fns";
import { Mail, Phone, User, Building2, Car, FileText } from "lucide-react";

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
  const [details, setDetails] = useState<LeadVisitDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadDetails();
    }
  }, [open, filters]);

  const loadDetails = async () => {
    setIsLoading(true);
    try {
      const response = await getSalesManagerDetails({
        ...filters,
        per_page: 50,
      });
      setDetails(response.data);
    } catch (error) {
      console.error("Error loading details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case "VALIDADO":
        return "default";
      case "NO VALIDADO":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalles de Visitas/Leads</SheetTitle>
          <SheetDescription>
            Información detallada de las visitas y leads registrados
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Cargando...</p>
            </div>
          ) : details.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">
                No hay detalles disponibles
              </p>
            </div>
          ) : (
            details.map((detail) => (
              <Card key={detail.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Cliente Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-semibold">Información del Cliente</h4>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Nombre</p>
                        <p className="font-medium">{detail.full_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Documento</p>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{detail.num_doc}</p>
                          <Badge
                            variant={getStatusBadgeVariant(
                              detail.status_num_doc
                            )}
                          >
                            {detail.status_num_doc}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{detail.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{detail.phone}</p>
                      </div>
                    </div>

                    {/* Vehículo Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-semibold">Vehículo de Interés</h4>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Marca</p>
                        <p className="font-medium">
                          {detail.vehicle_brand.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Modelo</p>
                        <p className="font-medium">{detail.model}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Versión</p>
                        <p className="text-sm">{detail.version}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Campaña</p>
                        <Badge variant="outline">{detail.campaign}</Badge>
                      </div>
                    </div>

                    {/* Asesor y Sede Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-semibold">Asesor y Sede</h4>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Asesor</p>
                        <p className="font-medium">
                          {detail.worker.nombre_completo}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Sede</p>
                        <p className="font-medium">{detail.sede.localidad}</p>
                        <p className="text-xs text-muted-foreground">
                          {detail.sede.suc_abrev}
                        </p>
                      </div>
                    </div>

                    {/* Registro Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-semibold">Información de Registro</h4>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Fecha Registro
                        </p>
                        <p className="font-medium">
                          {format(
                            new Date(detail.registration_date),
                            "dd/MM/yyyy"
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tipo</p>
                        <Badge>{detail.type}</Badge>
                      </div>
                      {detail.comment && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Comentario
                          </p>
                          <p className="text-sm">{detail.comment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

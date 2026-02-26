"use client";

import { GeneralModal } from "@/shared/components/GeneralModal";
import { VinMatchResponse } from "../lib/vehicles.interface";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface VehicleImportResultModalProps {
  open: boolean;
  onClose: () => void;
  result: VinMatchResponse;
}

export default function VehicleImportResultModal({
  open,
  onClose,
  result,
}: VehicleImportResultModalProps) {
  const { summary, matched, not_found, found_different_status } = result;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Resultado de Importación"
      icon="FileSpreadsheet"
      subtitle="Resumen del cruce de VINs con el archivo importado"
      size="5xl"
    >
      <div className="space-y-4 py-2">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCard
            label="Total en archivo"
            value={summary.total_vins_from_excel}
            variant="default"
          />
          <SummaryCard
            label="Coincidentes"
            value={summary.total_matched}
            variant="success"
          />
          <SummaryCard
            label="No encontrados"
            value={summary.total_not_found}
            variant="danger"
          />
          <SummaryCard
            label="Estado diferente"
            value={summary.total_found_different_status}
            variant="warning"
          />
        </div>

        {/* Detail tabs */}
        <Tabs defaultValue="matched">
          <TabsList className="w-full">
            <TabsTrigger value="matched" className="flex-1 gap-1">
              <CheckCircle2 className="size-3.5 text-green-500" />
              Coincidentes
              <Badge color="green" className="ml-1 text-xs">
                {summary.total_matched}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="not_found" className="flex-1 gap-1">
              <XCircle className="size-3.5 text-destructive" />
              No encontrados
              <Badge color="red" className="ml-1 text-xs">
                {summary.total_not_found}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="different" className="flex-1 gap-1">
              <AlertTriangle className="size-3.5 text-amber-500" />
              Estado diferente
              <Badge color="amber" className="ml-1 text-xs">
                {summary.total_found_different_status}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Matched */}
          <TabsContent value="matched">
            <div className="max-h-72 overflow-y-auto no-scrollbar rounded-md border mt-2">
              {matched.length === 0 ? (
                <EmptyState message="Sin coincidencias" />
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <Th>VIN</Th>
                      <Th>Año</Th>
                      <Th>Modelo</Th>
                      <Th>Color</Th>
                      <Th>Estado</Th>
                      <Th>Almacén</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {matched.map((item, i) => (
                      <tr
                        key={item.vin}
                        className={
                          i % 2 === 0 ? "bg-background" : "bg-muted/30"
                        }
                      >
                        <Td mono>{item.vin}</Td>
                        <Td>{item.year}</Td>
                        <Td>{item.model}</Td>
                        <Td>{item.color}</Td>
                        <Td>
                          <Badge
                            variant="outline"
                            className="text-xs whitespace-nowrap"
                          >
                            {item.vehicle_status}
                          </Badge>
                        </Td>
                        <Td>{item.warehouse_physical}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </TabsContent>

          {/* Not found */}
          <TabsContent value="not_found">
            <div className="max-h-72 overflow-y-auto no-scrollbar rounded-md border mt-2">
              {not_found.length === 0 ? (
                <EmptyState message="Todos los VINs fueron encontrados" />
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <Th>VIN</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {not_found.map((vin, i) => (
                      <tr
                        key={vin}
                        className={
                          i % 2 === 0 ? "bg-background" : "bg-muted/30"
                        }
                      >
                        <Td mono>{vin}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </TabsContent>

          {/* Different status */}
          <TabsContent value="different">
            <div className="max-h-72 overflow-y-auto no-scrollbar rounded-md border mt-2">
              {found_different_status.length === 0 ? (
                <EmptyState message="Sin vehículos con estado diferente" />
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <Th>VIN</Th>
                      <Th>ID</Th>
                      <Th>Estado actual</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {found_different_status.map((item, i) => (
                      <tr
                        key={item.vin}
                        className={
                          i % 2 === 0 ? "bg-background" : "bg-muted/30"
                        }
                      >
                        <Td mono>{item.vin}</Td>
                        <Td>{item.id}</Td>
                        <Td>
                          <div
                            className="text-sm font-medium"
                            style={{
                              color: item.vehicle_status_color,
                            }}
                          >
                            {item.vehicle_status}
                          </div>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-2">
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </GeneralModal>
  );
}

/* ── Helpers ─────────────────────────────────────────── */

function SummaryCard({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "default" | "success" | "danger" | "warning";
}) {
  const colors: Record<typeof variant, string> = {
    default: "bg-muted text-foreground",
    success: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
    danger: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  };
  return (
    <div className={`rounded-lg p-3 text-center ${colors[variant]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-0.5 opacity-80">{label}</p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <td className={`px-3 py-2 ${mono ? "font-mono text-xs" : "text-xs"}`}>
      {children}
    </td>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-8 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

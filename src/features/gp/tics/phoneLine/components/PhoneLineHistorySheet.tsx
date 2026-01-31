"use client";

import GeneralSheet from "@/shared/components/GeneralSheet";
import { usePhoneLineHistory } from "../lib/phoneLine.hook";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PhoneLineHistorySheetProps {
  open: boolean;
  phoneLineId: number | null;
  onClose: () => void;
}

export default function PhoneLineHistorySheet({
  open,
  phoneLineId,
  onClose,
}: PhoneLineHistorySheetProps) {
  const { data, isFetching } = usePhoneLineHistory(open ? phoneLineId : null);

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      icon="History"
      title="Historial de Asignaciones"
      subtitle="Registro de todas las asignaciones realizadas a esta línea telefónica"
      size="3xl"
    >
      {isFetching ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : !data || data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          No hay asignaciones registradas.
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trabajador</TableHead>
                <TableHead>Fecha asignación</TableHead>
                <TableHead>Fecha desasignación</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.worker_name}
                  </TableCell>
                  <TableCell>
                    {new Date(item.assigned_at).toLocaleDateString("es-PE", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    {item.unassigned_at
                      ? new Date(item.unassigned_at).toLocaleDateString(
                          "es-PE",
                          {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          },
                        )
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      color={item.unassigned_at ? "red" : "green"}
                      variant="outline"
                    >
                      {item.unassigned_at ? "Desasignado" : "Activo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}
    </GeneralSheet>
  );
}

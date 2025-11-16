"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { WorkerResource } from "@/src/features/gp/gestionhumana/personal/trabajadores/lib/worker.interface";

interface WorkerTableProps {
  workers: WorkerResource[];
  isLoading?: boolean;
}

export default function WorkerTable({ workers, isLoading }: WorkerTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-sm text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (!workers || workers.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-sm text-muted-foreground">
          No se encontraron trabajadores
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Sede</TableHead>
            <TableHead>Posición</TableHead>
            <TableHead>Razón de Inclusión</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workers.map((worker) => (
            <TableRow key={worker.id}>
              <TableCell className="font-medium">{worker.name}</TableCell>
              <TableCell>{worker.document}</TableCell>
              <TableCell>{worker.sede}</TableCell>
              <TableCell>{worker.position}</TableCell>
              <TableCell>
                {worker.inclusion_reason && (
                  <Badge variant="secondary">{worker.inclusion_reason}</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

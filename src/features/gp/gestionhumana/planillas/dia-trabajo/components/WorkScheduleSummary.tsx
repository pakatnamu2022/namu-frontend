"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  WorkScheduleWorkerSummary,
  WorkScheduleSummaryPeriod,
} from "../lib/work-schedule.interface";
import { CalendarDays, Loader2, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export interface AvailableWorker {
  id: number;
  name: string;
}

interface WorkScheduleSummaryProps {
  period?: WorkScheduleSummaryPeriod;
  summary: WorkScheduleWorkerSummary[];
  workersCount: number;
  isLoading?: boolean;
  selectedWorkerId?: number;
  onWorkerSelect?: (workerId: number) => void;
  availableWorkers?: AvailableWorker[];
  isLoadingWorkers?: boolean;
  onAddWorker?: (workerId: number, workerName: string) => void;
}

export function WorkScheduleSummary({
  period,
  summary,
  workersCount,
  isLoading = false,
  selectedWorkerId,
  onWorkerSelect,
  availableWorkers = [],
  isLoadingWorkers = false,
  onAddWorker,
}: WorkScheduleSummaryProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const summaryWorkerIds = new Set(summary.map((s) => s.worker_id));
  const filteredAvailable = availableWorkers.filter((w) => {
    if (summaryWorkerIds.has(w.id)) return false;
    if (!search) return true;
    return w.name.toLowerCase().includes(search.toLowerCase());
  });

  const handleSelectFromDialog = (worker: AvailableWorker) => {
    onAddWorker?.(worker.id, worker.name);
    setAddDialogOpen(false);
    setSearch("");
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="px-3 py-2 border-b flex items-center justify-between bg-muted/40">
          <Skeleton className="h-4 w-24" />
        </div>
        <CardContent className="p-0">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 border-b">
              <Skeleton className="h-3.5 flex-1" />
              <Skeleton className="h-3.5 w-14" />
              <Skeleton className="h-3.5 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden py-0">
        {/* Compact header */}
        <div className="px-3 py-2 border-b flex items-center justify-between bg-muted/40 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold">Trabajadores</span>
            <Badge variant="outline" className="text-xs h-4 px-1.5 py-0 leading-none">
              {workersCount}
            </Badge>
            {/* {period && (
              <Badge variant="outline" className="text-xs h-4 px-1.5 py-0 leading-none hidden sm:flex">
                {period.name}
              </Badge>
            )} */}
          </div>
          {onAddWorker && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1"
              onClick={() => setAddDialogOpen(true)}
            >
              <UserPlus className="h-3.5 w-3.5" />
              Agregar
            </Button>
          )}
        </div>

        {summary.length === 0 ? (
          <Empty className="min-h-[calc(100vh-14rem)] border-0 rounded-none">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarDays />
              </EmptyMedia>
              <EmptyTitle className="text-sm">Sin trabajadores</EmptyTitle>
              <EmptyDescription className="text-xs">
                Agrega un trabajador para comenzar
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
        <div className="overflow-y-auto max-h-[calc(100vh-14rem)]">
          <Table>
            <TableHeader className="hidden">
              <TableRow>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.map((worker) => {
                const isSelected = selectedWorkerId === worker.worker_id;
                return (
                  <TableRow
                    key={worker.worker_id}
                    className={cn(
                      "cursor-pointer transition-colors h-9",
                      isSelected
                        ? "bg-primary/10 hover:bg-primary/15"
                        : "hover:bg-muted/50",
                    )}
                    onClick={() => onWorkerSelect?.(worker.worker_id)}
                  >
                    <TableCell className="py-1.5 px-3">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div
                            className={cn(
                              "w-0.5 h-5 rounded-full shrink-0 transition-opacity",
                              isSelected ? "bg-primary opacity-100" : "opacity-0",
                            )}
                          />
                          <span className="text-xs font-medium truncate">
                            {worker.worker_name}
                          </span>
                        </div>
                        {isSelected && (
                          <CalendarDays className="h-3.5 w-3.5 text-primary shrink-0" />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        )}
      </Card>

      {/* Add worker dialog */}
      <Dialog
        open={addDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) setSearch("");
        }}
      >
        <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-3 border-b">
            <DialogTitle className="text-base">Agregar trabajador</DialogTitle>
            <DialogDescription className="text-xs mt-0.5">
              Selecciona un trabajador para gestionar su horario en este período.
            </DialogDescription>
          </DialogHeader>
          <Command>
            <CommandInput
              placeholder="Buscar trabajador..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList className="max-h-60">
              {isLoadingWorkers ? (
                <div className="py-6 flex flex-col items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando trabajadores...
                </div>
              ) : (
                <>
                  <CommandEmpty>No se encontraron trabajadores.</CommandEmpty>
                  <CommandGroup>
                    {filteredAvailable.map((worker) => (
                      <CommandItem
                        key={worker.id}
                        onSelect={() => handleSelectFromDialog(worker)}
                        className="cursor-pointer text-sm"
                      >
                        {worker.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}

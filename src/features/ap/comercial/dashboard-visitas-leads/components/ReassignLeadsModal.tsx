"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { useMyConsultants } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { usePendingLeadsByWorker } from "../../gestionar-leads/lib/manageLeads.hook";
import { transferWorkerLeads } from "../../gestionar-leads/lib/manageLeads.actions";
import { errorToast, successToast } from "@/core/core.function";

interface ReassignLeadsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReassignLeadsModal({
  open,
  onOpenChange,
}: ReassignLeadsModalProps) {
  const queryClient = useQueryClient();

  const [fromWorkerId, setFromWorkerId] = useState<string>("");
  const [toWorkerId, setToWorkerId] = useState<string>("");
  const [scope, setScope] = useState<"all" | "specific">("all");
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const now = new Date();
  const { data: consultants = [] } = useMyConsultants({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  const fromWorkerIdNum = fromWorkerId ? parseInt(fromWorkerId, 10) : null;
  const { data: pendingLeads = [], isLoading: isLoadingLeads } =
    usePendingLeadsByWorker(fromWorkerIdNum);

  const handleClose = () => {
    setFromWorkerId("");
    setToWorkerId("");
    setScope("all");
    setSelectedLeadIds([]);
    setErrorMsg("");
    onOpenChange(false);
  };

  const handleFromWorkerChange = (value: string) => {
    setFromWorkerId(value);
    setToWorkerId("");
    setSelectedLeadIds([]);
    setScope("all");
    setErrorMsg("");
  };

  const handleScopeChange = (value: "all" | "specific") => {
    setScope(value);
    setSelectedLeadIds([]);
  };

  const toggleLeadSelection = (leadId: number) => {
    setSelectedLeadIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId],
    );
  };

  const handleTransfer = async () => {
    if (!fromWorkerIdNum || !toWorkerId) return;
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const response = await transferWorkerLeads({
        from_worker_id: fromWorkerIdNum,
        to_worker_id: parseInt(toWorkerId, 10),
        potential_buyer_ids: scope === "specific" ? selectedLeadIds : [],
      });
      successToast(response.message);
      queryClient.invalidateQueries({ queryKey: ["salesManagerStats"] });
      handleClose();
    } catch (error: any) {
      setErrorMsg(
        error.response?.data?.message ?? "Error al transferir los leads",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fromWorkerName =
    consultants.find((c) => c.id.toString() === fromWorkerId)?.name ?? "";
  const toWorkerName =
    consultants.find((c) => c.id.toString() === toWorkerId)?.name ?? "";
  const transferCount =
    scope === "all" ? pendingLeads.length : selectedLeadIds.length;

  const destinationOptions = consultants
    .filter((c) => c.id.toString() !== fromWorkerId)
    .map((c) => ({ label: c.name, value: c.id.toString() }));

  const showScopeStep =
    !!fromWorkerId && !!toWorkerId && pendingLeads.length > 0;
  const canConfirm =
    !!fromWorkerId &&
    !!toWorkerId &&
    !isLoadingLeads &&
    (scope === "all" ? pendingLeads.length > 0 : selectedLeadIds.length > 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Reasignar leads</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-2 pr-1">
          {/* Paso 1: Selección de asesores */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">
              1. Selección de asesores
            </p>
            <div className="grid grid-cols-2 gap-4">
              <SearchableSelect
                label="Asesor origen"
                options={consultants.map((c) => ({
                  label: c.name,
                  value: c.id.toString(),
                }))}
                value={fromWorkerId}
                onChange={handleFromWorkerChange}
                placeholder="Seleccionar asesor"
              />
              <SearchableSelect
                label="Asesor destino"
                options={destinationOptions}
                value={toWorkerId}
                onChange={setToWorkerId}
                placeholder="Seleccionar asesor"
                disabled={!fromWorkerId}
              />
            </div>

            {fromWorkerId && (
              <p className="text-sm text-muted-foreground">
                {isLoadingLeads ? (
                  "Cargando leads pendientes..."
                ) : (
                  <>
                    <span className="font-medium text-foreground">
                      {fromWorkerName}
                    </span>{" "}
                    tiene{" "}
                    <span className="font-semibold text-foreground">
                      {pendingLeads.length}
                    </span>{" "}
                    lead(s) pendiente(s)
                  </>
                )}
              </p>
            )}
          </div>

          {/* Paso 2: Alcance */}
          {showScopeStep && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">
                2. Alcance de la transferencia
              </p>
              <RadioGroup
                value={scope}
                onValueChange={(v) => handleScopeChange(v as "all" | "specific")}
                className="space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="scope-all" />
                  <Label htmlFor="scope-all" className="cursor-pointer">
                    Transferir todos los pendientes ({pendingLeads.length})
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="specific" id="scope-specific" />
                  <Label htmlFor="scope-specific" className="cursor-pointer">
                    Seleccionar específicos
                  </Label>
                </div>
              </RadioGroup>

              {scope === "specific" && (
                <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                  {pendingLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleLeadSelection(lead.id)}
                    >
                      <Checkbox
                        checked={selectedLeadIds.includes(lead.id)}
                        onCheckedChange={() => toggleLeadSelection(lead.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {lead.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {lead.phone}
                          {lead.campaign ? ` · ${lead.campaign}` : ""}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {lead.vehicle_brand}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Paso 3: Confirmación */}
          {fromWorkerId && toWorkerId && (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                3. Confirmación
              </p>
              <p className="text-sm text-muted-foreground">
                Se transferirán{" "}
                <span className="font-semibold text-foreground">
                  {transferCount}
                </span>{" "}
                lead(s) de{" "}
                <span className="font-semibold text-foreground">
                  {fromWorkerName}
                </span>{" "}
                a{" "}
                <span className="font-semibold text-foreground">
                  {toWorkerName}
                </span>
              </p>
            </div>
          )}

          {errorMsg && (
            <p className="text-sm text-destructive">{errorMsg}</p>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleTransfer} disabled={!canConfirm || isSubmitting}>
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Confirmar transferencia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

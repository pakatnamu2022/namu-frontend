"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { useMyConsultants } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { usePendingLeadsByWorker } from "../../gestionar-leads/lib/manageLeads.hook";
import { transferWorkerLeads } from "../../gestionar-leads/lib/manageLeads.actions";
import { successToast } from "@/core/core.function";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { cn } from "@/lib/utils";
import { format, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { DateRangePickerFilter } from "@/shared/components/DateRangePickerFilter";

interface ReassignLeadsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function StepIndicator({
  steps,
  activeStep,
  completedSteps,
}: {
  steps: { label: string }[];
  activeStep: number;
  completedSteps: number[];
}) {
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {steps.map((_, index) => {
          const stepNumber = index + 1;
          const isDone = completedSteps.includes(stepNumber);
          const isActive = activeStep === stepNumber;
          return (
            <div
              key={stepNumber}
              className={cn(
                "h-0.5 flex-1 rounded-full transition-all duration-300",
                isDone
                  ? "bg-primary"
                  : isActive
                    ? "bg-primary/40"
                    : "bg-muted-foreground/15",
              )}
            />
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        {steps[activeStep - 1]?.label}
        <span className="text-muted-foreground/50 ml-1.5">
          {activeStep} / {steps.length}
        </span>
      </p>
    </div>
  );
}

export default function ReassignLeadsModal({
  open,
  onOpenChange,
}: ReassignLeadsModalProps) {
  const queryClient = useQueryClient();

  const [fromWorkerId, setFromWorkerId] = useState<string>("");
  const [toWorkerId, setToWorkerId] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    startOfMonth(new Date()),
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  const [scope, setScope] = useState<"all" | "quantity" | "specific">("all");
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const now = new Date();
  const { data: consultants = [] } = useMyConsultants({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  const fromWorkerIdNum = fromWorkerId ? parseInt(fromWorkerId, 10) : null;
  const registrationDateParam =
    dateFrom && dateTo
      ? [format(dateFrom, "yyyy-MM-dd"), format(dateTo, "yyyy-MM-dd")]
      : dateFrom
        ? [format(dateFrom, "yyyy-MM-dd")]
        : undefined;
  const { data: pendingLeads = [], isLoading: isLoadingLeads } =
    usePendingLeadsByWorker(fromWorkerIdNum, {
      sort: "created_at",
      direction: "desc",
      ...(registrationDateParam ? { created_at: registrationDateParam } : {}),
    });

  const handleClose = () => {
    setFromWorkerId("");
    setToWorkerId("");
    setDateFrom(startOfMonth(new Date()));
    setDateTo(new Date());
    setScope("all");
    setSelectedLeadIds([]);
    setErrorMsg("");
    onOpenChange(false);
  };

  const handleFromWorkerChange = (value: string) => {
    setFromWorkerId(value);
    setToWorkerId("");
    setDateFrom(startOfMonth(new Date()));
    setDateTo(new Date());
    setSelectedLeadIds([]);
    setScope("all");
    setErrorMsg("");
  };

  const handleScopeChange = (value: "all" | "quantity" | "specific") => {
    setScope(value);
    setSelectedLeadIds([]);
    setQuantity(1);
  };

  const handleQuantityChange = (next: number) => {
    setQuantity(Math.min(Math.max(1, next), pendingLeads.length));
  };

  const toggleLeadSelection = (leadId: number) => {
    setSelectedLeadIds((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId],
    );
  };

  const handleTransfer = async () => {
    if (!fromWorkerIdNum || !toWorkerId) return;
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const baseBody = {
        from_worker_id: fromWorkerIdNum,
        to_worker_id: parseInt(toWorkerId, 10),
      };
      const body =
        scope === "all"
          ? {
              ...baseBody,
              date_from: format(dateFrom!, "yyyy-MM-dd"),
              date_to: format(dateTo!, "yyyy-MM-dd"),
            }
          : {
              ...baseBody,
              potential_buyer_ids:
                scope === "quantity"
                  ? pendingLeads.slice(0, quantity).map((l) => l.id)
                  : selectedLeadIds,
            };
      const response = await transferWorkerLeads(body);
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
    scope === "all"
      ? pendingLeads.length
      : scope === "quantity"
        ? quantity
        : selectedLeadIds.length;

  const destinationOptions = consultants
    .filter((c) => c.id.toString() !== fromWorkerId)
    .map((c) => ({ label: c.name, value: c.id.toString() }));

  const step1Done = !!fromWorkerId && !!toWorkerId && !isLoadingLeads;
  const showScopeStep = step1Done && pendingLeads.length > 0;
  const step2Done =
    !showScopeStep ||
    (scope === "all" && !!dateFrom && !!dateTo) ||
    (scope === "quantity" && quantity >= 1) ||
    selectedLeadIds.length > 0;
  const canConfirm = step1Done && step2Done;

  const steps = showScopeStep
    ? [{ label: "Asesores" }, { label: "Alcance" }, { label: "Confirmar" }]
    : [{ label: "Asesores" }, { label: "Confirmar" }];

  let activeStep: number;
  if (!step1Done) activeStep = 1;
  else if (showScopeStep && !step2Done) activeStep = 2;
  else activeStep = steps.length;

  const completedSteps: number[] = [];
  if (step1Done) completedSteps.push(1);
  if (showScopeStep && step2Done) completedSteps.push(2);

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title="Reasignar leads"
      size="2xl"
      icon="ArrowLeftRight"
      childrenFooter={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={!canConfirm || isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar transferencia
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <StepIndicator
          steps={steps}
          activeStep={activeStep}
          completedSteps={completedSteps}
        />

        {/* Selección de asesores */}
        <div className="space-y-3">
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
            <DateRangePickerFilter
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateChange={(from, to) => {
                setDateFrom(from);
                setDateTo(to);
                setSelectedLeadIds([]);
              }}
            />
          )}

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
                  {(dateFrom || dateTo) && (
                    <span className="text-muted-foreground/60">
                      {" "}
                      en el rango seleccionado
                    </span>
                  )}
                </>
              )}
            </p>
          )}
        </div>

        {/* Alcance de la transferencia */}
        {showScopeStep && (
          <div className="space-y-3">
            <RadioGroup
              value={scope}
              onValueChange={(v) =>
                handleScopeChange(v as "all" | "quantity" | "specific")
              }
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="scope-all" />
                <Label htmlFor="scope-all" className="cursor-pointer">
                  Transferir todos los pendientes ({pendingLeads.length})
                </Label>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="quantity" id="scope-quantity" />
                  <Label htmlFor="scope-quantity" className="cursor-pointer">
                    Seleccionar por cantidad
                  </Label>
                </div>
                {scope === "quantity" && (
                  <div className="ml-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8 shrink-0"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        <Minus className="size-3.5" />
                      </Button>
                      <Input
                        type="number"
                        min={1}
                        max={pendingLeads.length}
                        value={quantity}
                        onChange={(e) =>
                          handleQuantityChange(parseInt(e.target.value) || 1)
                        }
                        className="w-20 text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8 shrink-0"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= pendingLeads.length}
                      >
                        <Plus className="size-3.5" />
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        de {pendingLeads.length} leads
                      </span>
                    </div>
                    <div className="border rounded-md divide-y max-h-64 overflow-y-auto">
                      {pendingLeads.slice(0, quantity).map((lead, i) => (
                        <div
                          key={lead.id}
                          className="flex items-center gap-3 px-3 py-2"
                        >
                          <span className="text-xs text-muted-foreground w-4 shrink-0">
                            {i + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {lead.full_name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {lead.phone}
                              {lead.campaign ? ` · ${lead.campaign}` : ""}
                              {lead.created_at
                                ? ` · ${format(new Date(`${lead.created_at}T00:00:00`), "PPP", { locale: es })}`
                                : ""}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {lead.vehicle_brand}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="specific" id="scope-specific" />
                <Label htmlFor="scope-specific" className="cursor-pointer">
                  Seleccionar específicos manualmente
                </Label>
              </div>
            </RadioGroup>

            {scope === "specific" && (
              <div className="border rounded-md divide-y max-h-64 overflow-y-auto">
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
                        {lead.created_at
                          ? ` · ${format(new Date(`${lead.created_at}T00:00:00`), "PPP", { locale: es })}`
                          : ""}
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

        {/* Resumen de confirmación */}
        {canConfirm && (
          <div className="rounded-md bg-muted/50 border px-4 py-3">
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

        {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}
      </div>
    </GeneralSheet>
  );
}

"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getRegeneratePreview } from "../lib/evaluationPerson.actions";
import type { RegeneratePreviewResponse } from "../lib/evaluationPerson.interface";

interface RegeneratePreviewDialogProps {
  personId: number;
  evaluationId: number;
  onConfirm: () => void;
  trigger?: React.ReactNode;
}

export function RegeneratePreviewDialog({
  personId,
  evaluationId,
  onConfirm,
  trigger,
}: RegeneratePreviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [previewData, setPreviewData] =
    useState<RegeneratePreviewResponse | null>(null);

  const previewMutation = useMutation({
    mutationFn: () => getRegeneratePreview(personId, evaluationId),
    onSuccess: (data) => {
      setPreviewData(data);
    },
  });

  const handleOpen = () => {
    setOpen(true);
    // Cuando se abre el modal, hacer la petición
    previewMutation.mutate();
  };

  const handleClose = () => {
    setOpen(false);
    // Limpiar datos al cerrar
    setPreviewData(null);
    previewMutation.reset();
  };

  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={handleClose}>
        Cancelar
      </Button>
      <Button
        onClick={handleConfirm}
        disabled={
          !previewData ||
          !previewData.can_regenerate ||
          previewMutation.isPending
        }
        className="gap-2"
      >
        <RefreshCw className="size-4" />
        Regenerar Evaluación
      </Button>
    </div>
  );

  const initials = previewData?.person.name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const changeRows = previewData
    ? [
        {
          label: "Evaluaciones de persona",
          before: previewData.what_will_be_deleted.evaluation_persons,
          after: previewData.what_will_be_created.evaluation_persons,
        },
        {
          label: "Detalles de ciclo",
          before: previewData.what_will_be_deleted.person_cycle_details,
          after: previewData.what_will_be_created.person_cycle_details,
        },
        {
          label: "Competencias",
          before: previewData.what_will_be_deleted.competences,
          after: previewData.what_will_be_created.competence_details || 0,
        },
      ]
    : [];

  return (
    <>
      <div onClick={handleOpen}>
        {trigger || (
          <Button variant="outline" size="icon" className="h-7">
            <RefreshCw className="size-5" />
          </Button>
        )}
      </div>

      <GeneralModal
        open={open}
        onClose={handleClose}
        title="Vista Previa de Regeneración"
        subtitle="Revisa los cambios que se realizarán antes de regenerar la evaluación"
        size="2xl"
        icon="RefreshCw"
        childrenFooter={footer}
      >
        <div className="space-y-5">
          {previewMutation.isPending && (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="size-7 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                Cargando información…
              </span>
            </div>
          )}

          {previewMutation.isError && (
            <div className="flex items-center gap-3 rounded-2xl bg-red-50 dark:bg-red-950/40 p-4 shadow-sm">
              <XCircle className="size-4 text-red-600 dark:text-red-400 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">
                Error al cargar la información. Por favor, intenta
                nuevamente.
              </p>
            </div>
          )}

          {previewData && (
            <>
              {/* Estado general */}
              <div
                className={cn(
                  "flex items-center gap-4 rounded-2xl p-5 shadow-sm",
                  previewData.can_regenerate
                    ? "bg-emerald-50 dark:bg-emerald-950/30"
                    : "bg-red-50 dark:bg-red-950/30",
                )}
              >
                <div
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-full",
                    previewData.can_regenerate
                      ? "bg-emerald-500/15"
                      : "bg-red-500/15",
                  )}
                >
                  {previewData.can_regenerate ? (
                    <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <XCircle className="size-5 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      previewData.can_regenerate
                        ? "text-emerald-800 dark:text-emerald-300"
                        : "text-red-800 dark:text-red-300",
                    )}
                  >
                    {previewData.can_regenerate
                      ? "Todo listo para regenerar"
                      : "No se puede regenerar"}
                  </p>
                  <p
                    className={cn(
                      "text-xs",
                      previewData.can_regenerate
                        ? "text-emerald-700/80 dark:text-emerald-300/70"
                        : "text-red-700/80 dark:text-red-300/70",
                    )}
                  >
                    {previewData.can_regenerate
                      ? "Se validó la información sin errores bloqueantes."
                      : "Corrige los errores listados antes de continuar."}
                  </p>
                </div>
              </div>

              {/* Persona */}
              <div className="flex items-center gap-4 rounded-2xl bg-muted/40 p-4 shadow-sm">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">
                    {previewData.person.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {previewData.person.position} · DNI{" "}
                    {previewData.person.dni}
                  </p>
                </div>
                <Badge color="muted" variant="outline" size="sm">
                  {previewData.person.hierarchical_category}
                </Badge>
              </div>

              {/* Comparativa de cambios */}
              <div className="rounded-2xl bg-muted/40 p-4 shadow-sm">
                <p className="text-xs font-medium text-muted-foreground mb-3 px-1">
                  Antes → Después
                </p>
                <div className="space-y-1">
                  {changeRows.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-background/60 transition-colors"
                    >
                      <span className="text-sm">{row.label}</span>
                      <div className="flex items-center gap-2">
                        <Badge color="red" variant="ghost" size="sm">
                          {row.before}
                        </Badge>
                        <ArrowRight className="size-3.5 text-muted-foreground/50" />
                        <Badge color="emerald" variant="ghost" size="sm">
                          {row.after}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detalles: validaciones, advertencias y errores */}
              {(previewData.validations.length > 0 ||
                previewData.warnings.length > 0 ||
                previewData.errors.length > 0) && (
                <div className="space-y-2.5">
                  {previewData.errors.map((error, index) => (
                    <NoteRow key={`err-${index}`} tone="red" text={error} />
                  ))}
                  {previewData.warnings.map((warning, index) => (
                    <NoteRow
                      key={`warn-${index}`}
                      tone="amber"
                      text={warning}
                    />
                  ))}
                  {previewData.validations.map((validation, index) => (
                    <NoteRow
                      key={`val-${index}`}
                      tone="emerald"
                      text={validation}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </GeneralModal>
    </>
  );
}

function NoteRow({
  tone,
  text,
}: {
  tone: "emerald" | "amber" | "red";
  text: string;
}) {
  const Icon =
    tone === "emerald"
      ? CheckCircle2
      : tone === "amber"
        ? AlertTriangle
        : XCircle;

  const iconColor =
    tone === "emerald"
      ? "text-emerald-500"
      : tone === "amber"
        ? "text-amber-500"
        : "text-red-500";

  return (
    <div className="flex items-start gap-2.5 px-1">
      <Icon className={cn("size-4 mt-0.5 shrink-0", iconColor)} />
      <span className="text-sm text-foreground/90">{text}</span>
    </div>
  );
}

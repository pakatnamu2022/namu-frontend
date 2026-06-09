"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft,
  Banknote,
  CheckCircle,
  Loader2,
  Pencil,
} from "lucide-react";
import { InfoSection } from "@/shared/components/InfoSection";
import {
  DetailSheetTable,
  type DetailSheetTableColumn,
} from "@/shared/components/DetailSheetTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatDate,
  formatMoney,
  errorToast,
  successToast,
} from "@/core/core.function";
import {
  confirmLoanExtraDiscount,
  findLoanById,
} from "@/features/gp/gestionhumana/planillas/loans/lib/loan.actions";
import { LoanExtraDiscountResource } from "@/features/gp/gestionhumana/planillas/loans/lib/loan.interface";
import { LoanAmortizeDialog } from "@/features/gp/gestionhumana/planillas/loans/components/LoanAmortizeDialog";
import { LoanEditDiscountDialog } from "@/features/gp/gestionhumana/planillas/loans/components/LoanEditDiscountDialog";
import { LOAN } from "@/features/gp/gestionhumana/planillas/loans/lib/loan.constant";

export default function LoanAmortizacionesPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { ABSOLUTE_ROUTE } = LOAN;
  const [amortizeOpen, setAmortizeOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] =
    useState<LoanExtraDiscountResource | null>(null);
  const [confirmingIds, setConfirmingIds] = useState<Set<number>>(new Set());

  const loanId = Number(id);

  const { data, isLoading } = useQuery({
    queryKey: ["loan-detail", loanId],
    queryFn: () => findLoanById(loanId),
    enabled: !!loanId,
  });

  const confirmMutation = useMutation({
    mutationFn: (discountId: number) => confirmLoanExtraDiscount(discountId),
    onMutate: (discountId) => {
      setConfirmingIds((prev) => new Set(prev).add(discountId));
    },
    onSettled: (_, __, discountId) => {
      setConfirmingIds((prev) => {
        const next = new Set(prev);
        next.delete(discountId);
        return next;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loan-detail", loanId] });
      successToast("Descuento confirmado correctamente.");
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ?? "No se pudo confirmar el descuento.",
      );
    },
  });

  const extraDiscounts: LoanExtraDiscountResource[] =
    data?.extra_discounts ?? [];
  const loanAmount = Number(data?.loan_amount ?? 0);
  const installmentsCount = data?.installments_count ?? null;
  const remainingBalance = Number(data?.remaining_balance ?? 0);
  const totalPagado = extraDiscounts
    .filter((d) => d.applied)
    .reduce((sum, d) => sum + Number(d.amount), 0);
  const paymentDays = data?.payment_days ?? [];

  const infoFields = [
    {
      label: "Trabajador",
      value: data?.worker ?? "—",
    },
    {
      label: "Fecha de entrega",
      value: formatDate(data?.delivery_date),
    },
    {
      label: "Inicio de pago",
      value: formatDate(data?.payment_start),
    },
    {
      label: "Motivo",
      value: data?.reason ?? "—",
    },
    {
      label: "Monto préstamo",
      value: formatMoney(loanAmount),
    },
    {
      label: "Cuotas",
      value:
        installmentsCount != null
          ? `${installmentsCount} cuota${installmentsCount !== 1 ? "s" : ""} de ${formatMoney(Number(data?.installment_amount ?? 0))}`
          : "—",
    },
    {
      label: "Saldo pendiente",
      value: (
        <p
          className={`text-sm font-medium ${remainingBalance > 0 ? "text-destructive" : "text-green-600"}`}
        >
          {formatMoney(remainingBalance)}
        </p>
      ),
    },
    {
      label: "Días de amortización",
      value:
        paymentDays.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {paymentDays.map((d) => (
              <Badge
                key={d}
                variant="outline"
                className="font-mono text-xs px-1.5 py-0"
              >
                Día {d}
              </Badge>
            ))}
          </div>
        ) : (
          "—"
        ),
    },
  ];

  const amortizacionColumns: DetailSheetTableColumn<LoanExtraDiscountResource>[] =
    [
      {
        header: "Fecha programada",
        render: (d) => formatDate(d.scheduled_date),
      },
      {
        header: "Concepto",
        render: (d) => (
          <span className="text-muted-foreground">{d.concept_type}</span>
        ),
      },
      {
        header: "Monto",
        className: "text-right font-mono",
        render: (d) => formatMoney(Number(d.amount)),
      },
      {
        header: "Estado",
        className: "text-center",
        render: (d) => (
          <Badge variant={d.applied ? "default" : "outline"}>
            {d.applied ? "Aplicado" : "Pendiente"}
          </Badge>
        ),
      },
      {
        header: "Confirmado por",
        className: "text-center",
        render: (d) =>
          d.confirmed_by_name ? (
            <span className="flex flex-col items-center gap-0.5 text-xs text-muted-foreground">
              <span>{d.confirmed_by_name}</span>
              <span className="text-[11px] opacity-70">
                {formatDate(d.confirmed_at)}
              </span>
            </span>
          ) : (
            "—"
          ),
      },
      {
        header: "Acciones",
        className: "text-center",
        render: (d) => {
          const isConfirming = confirmingIds.has(d.id);
          return (
            <div className="flex items-center justify-center gap-1">
              {!d.confirmed_by && !d.applied && (
                <>
                  <Button
                    size="default"
                    variant="outline"
                    onClick={() => setEditingDiscount(d)}
                    tooltip="Editar pago"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="default"
                    variant="outline"
                    disabled={isConfirming}
                    onClick={() => confirmMutation.mutate(d.id)}
                    tooltip="Confirmar pago"
                  >
                    {isConfirming ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </>
              )}
              {d.applied && (
                <span className="text-xs text-muted-foreground">—</span>
              )}
              {d.confirmed_by && !d.applied && (
                <span className="text-xs text-muted-foreground italic">
                  Confirmado
                </span>
              )}
            </div>
          );
        },
      },
    ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10 text-muted-foreground text-sm">
        Cargando...
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => router(ABSOLUTE_ROUTE)}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">
              Amortizaciones del préstamo
            </h1>
            <p className="text-sm text-muted-foreground">
              {data?.worker ?? "—"}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="gap-2"
          onClick={() => setAmortizeOpen(true)}
        >
          <Banknote className="size-4" />
          Registrar amortización
        </Button>
      </div>

      {/* Info general */}
      <InfoSection
        title="Información del préstamo"
        icon={Banknote}
        fields={infoFields}
        columns={4}
      />

      {/* Tabla de amortizaciones */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            Cronograma de amortizaciones
          </h3>
          <span className="text-sm text-muted-foreground">
            Total pagado:{" "}
            <span className="font-medium">{formatMoney(totalPagado)}</span>
          </span>
        </div>
        <DetailSheetTable
          rows={extraDiscounts}
          columns={amortizacionColumns}
          getKey={(d) => d.id}
          emptyMessage="No hay cuotas registradas aún."
        />
      </div>

      <LoanAmortizeDialog
        loanId={loanId}
        open={amortizeOpen}
        onOpenChange={setAmortizeOpen}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["loan-detail", loanId] })
        }
      />

      <LoanEditDiscountDialog
        discount={editingDiscount}
        open={editingDiscount !== null}
        onOpenChange={(open) => {
          if (!open) setEditingDiscount(null);
        }}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["loan-detail", loanId] })
        }
      />
    </div>
  );
}

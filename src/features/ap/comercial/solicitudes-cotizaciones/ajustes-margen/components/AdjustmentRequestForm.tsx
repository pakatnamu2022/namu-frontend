"use client";

import { useMemo, useState } from "react";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { NumberFormat } from "@/shared/components/NumberFormat";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { errorToast, successToast } from "@/core/core.function";
import { PurchaseRequestQuoteResource } from "../../lib/purchaseRequestQuote.interface";
import {
  useAllConceptDiscountBond,
  useDiscountCouponsByQuote,
} from "../../lib/purchaseRequestQuote.hook";
import { BonusDiscountSheet } from "../../components/BonusDiscountSheet";
import { BonusDiscountRow } from "../../components/BonusDiscountTable";
import { useCreateAdjustmentRequest } from "../lib/purchaseRequestQuoteAdjustment.hook";
import {
  AdjustmentAction,
  AdjustmentItemPayload,
} from "../lib/purchaseRequestQuoteAdjustment.interface";
import { ADJUSTMENT_ACTION_LABEL } from "../lib/purchaseRequestQuoteAdjustment.constants";

interface StagedItem {
  key: string;
  action: AdjustmentAction;
  discount_coupon_id?: number;
  concept_label: string;
  type?: "FIJO" | "PORCENTAJE";
  value?: number;
  has_retention?: boolean;
  concept_code_id?: number;
  previous_precio_unitario?: number;
}

interface Props {
  quote: PurchaseRequestQuoteResource;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AdjustmentRequestForm({
  quote,
  onSuccess,
  onCancel,
}: Props) {
  const { data: conceptsOptions = [] } = useAllConceptDiscountBond();
  const { data: coupons = [], isLoading } = useDiscountCouponsByQuote(
    quote.id,
  );
  const createAdjustment = useCreateAdjustmentRequest();

  const [reason, setReason] = useState("");
  const [stagedItems, setStagedItems] = useState<StagedItem[]>([]);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<
    (typeof coupons)[number] | null
  >(null);
  const [deleteCouponId, setDeleteCouponId] = useState<number | null>(null);

  const stagedCouponIds = useMemo(
    () =>
      new Set(
        stagedItems
          .filter((item) => item.discount_coupon_id)
          .map((item) => item.discount_coupon_id),
      ),
    [stagedItems],
  );

  const availableCoupons = coupons.filter(
    (coupon) => !stagedCouponIds.has(coupon.id),
  );

  const salePrice = Number(quote.sale_price) || 0;
  const currencySymbol = quote.doc_type_currency_symbol || "S/";

  const handleAddCreate = (values: Omit<BonusDiscountRow, "id">) => {
    setStagedItems((prev) => [
      ...prev,
      {
        key: `new_${Date.now()}`,
        action: "create",
        concept_label: values.concept_label,
        concept_code_id: Number(values.concept_id),
        type: values.isPercentage ? "PORCENTAJE" : "FIJO",
        value: values.valor,
        has_retention: values.hasRetention,
      },
    ]);
  };

  const handleEditSubmit = (values: Omit<BonusDiscountRow, "id">) => {
    if (!editingCoupon) return;
    setStagedItems((prev) => [
      ...prev,
      {
        key: `update_${editingCoupon.id}`,
        action: "update",
        discount_coupon_id: editingCoupon.id,
        concept_label: values.concept_label,
        concept_code_id: Number(values.concept_id),
        type: values.isPercentage ? "PORCENTAJE" : "FIJO",
        value: values.valor,
        has_retention: values.hasRetention,
        previous_precio_unitario: Number(editingCoupon.precio_unitario),
      },
    ]);
    setEditingCoupon(null);
  };

  const handleConfirmDelete = () => {
    const coupon = coupons.find((c) => c.id === deleteCouponId);
    if (!coupon) return;
    setStagedItems((prev) => [
      ...prev,
      {
        key: `delete_${coupon.id}`,
        action: "delete",
        discount_coupon_id: coupon.id,
        concept_label: coupon.concept_code,
        previous_precio_unitario: Number(coupon.precio_unitario),
      },
    ]);
    setDeleteCouponId(null);
  };

  const handleRemoveStaged = (key: string) => {
    setStagedItems((prev) => prev.filter((item) => item.key !== key));
  };

  const handleSubmit = async () => {
    if (stagedItems.length === 0) {
      errorToast("Debe agregar al menos una línea de cambio.");
      return;
    }

    // `item.value` ya es el monto final (neto): al agregar, el sheet aplica el
    // 7% (valorEfectivo); al editar, se toma el valor actual tal cual. El
    // backend lo guarda sin recalcular; `has_retention` es solo etiqueta.
    const items: AdjustmentItemPayload[] = stagedItems.map((item) => ({
      action: item.action,
      discount_coupon_id: item.discount_coupon_id ?? null,
      concept_code_id: item.concept_code_id ?? null,
      type: item.type ?? null,
      value: item.value,
      has_retention: item.has_retention,
    }));

    try {
      await createAdjustment.mutateAsync({
        purchase_request_quote_id: quote.id,
        reason: reason || undefined,
        items,
      });
      successToast(
        "Solicitud de ajuste enviada. Quedará pendiente de aprobación contable.",
      );
      onSuccess();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ||
          "No se pudo enviar la solicitud de ajuste.",
      );
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Bonos / Descuentos actuales</Label>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : availableCoupons.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay más bonos/descuentos disponibles para editar o eliminar.
            </p>
          ) : (
            <div className="rounded-lg border divide-y">
              {availableCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{coupon.concept_code}</span>
                    <span
                      className={
                        coupon.is_negative
                          ? "text-red-600"
                          : "text-emerald-600"
                      }
                    >
                      {coupon.is_negative ? "- " : ""}
                      {currencySymbol}{" "}
                      <NumberFormat
                        value={Number(coupon.precio_unitario).toFixed(2)}
                      />
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingCoupon(coupon)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteCouponId(coupon.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setAddSheetOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Agregar Bono / Descuento
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Cambios a solicitar</Label>
          {stagedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no has agregado ninguna línea de cambio.
            </p>
          ) : (
            <div className="rounded-lg border divide-y">
              {stagedItems.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {ADJUSTMENT_ACTION_LABEL[item.action]} ·{" "}
                      {item.concept_label}
                    </span>
                    {item.action !== "delete" && (
                      <span className="text-muted-foreground text-xs">
                        Nuevo valor: {item.type === "PORCENTAJE" ? "" : currencySymbol}{" "}
                        {item.value} {item.type === "PORCENTAJE" ? "%" : ""}
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveStaged(item.key)}
                    className="text-muted-foreground hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="adjustment-reason">Motivo del ajuste (opcional)</Label>
          <Textarea
            id="adjustment-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej. Cayó un bono financiero adicional tras la facturación."
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={createAdjustment.isPending}>
            {createAdjustment.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Solicitud"
            )}
          </Button>
        </div>
      </div>

      <BonusDiscountSheet
        open={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        onSubmit={handleAddCreate}
        conceptsOptions={conceptsOptions}
        costoReferencia={salePrice}
        currencySymbol={currencySymbol}
        mode="add"
      />

      <BonusDiscountSheet
        open={!!editingCoupon}
        onClose={() => setEditingCoupon(null)}
        onSubmit={handleEditSubmit}
        conceptsOptions={conceptsOptions}
        costoReferencia={salePrice}
        currencySymbol={currencySymbol}
        mode="edit"
        initialValues={
          editingCoupon
            ? {
                parent_concept_id: (
                  editingCoupon.concept_code_parent_id ??
                  editingCoupon.concept_code_id
                ).toString(),
                concept_id: editingCoupon.concept_code_id.toString(),
                concept_label: editingCoupon.concept_code,
                isPercentage: editingCoupon.type === "PORCENTAJE",
                valor: Number(editingCoupon.precio_unitario),
                isNegative: editingCoupon.is_negative,
                hasRetention: editingCoupon.has_retention,
              }
            : undefined
        }
      />

      {deleteCouponId !== null && (
        <ConfirmationDialog
          trigger={<span className="hidden" />}
          title="¿Marcar este bono/descuento para eliminar?"
          description="Se incluirá en la solicitud de ajuste como una eliminación. El cambio real solo se aplicará si contabilidad lo aprueba."
          confirmText="Sí, marcar para eliminar"
          cancelText="Cancelar"
          onConfirm={handleConfirmDelete}
          variant="destructive"
          icon="warning"
          open={true}
          onOpenChange={(nextOpen) => !nextOpen && setDeleteCouponId(null)}
        />
      )}
    </>
  );
}

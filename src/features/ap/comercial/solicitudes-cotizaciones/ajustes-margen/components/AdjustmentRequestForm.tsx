"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Tag,
  Gift,
  ListChecks,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
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
import { AccesorySheet } from "../../components/AccesorySheet";
import { CreateApprovedAccessoryModal } from "../../components/CreateApprovedAccessoryModal";
import { ApprovedAccessoryRow } from "../../components/ApprovedAccessoriesTable";
import { ApprovedAccesoriesResource } from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.interface";
import { useCreateAdjustmentRequest } from "../lib/purchaseRequestQuoteAdjustment.hook";
import {
  AdjustmentAction,
  AdjustmentItemPayload,
  AdjustmentItemType,
} from "../lib/purchaseRequestQuoteAdjustment.interface";
import { ADJUSTMENT_ACTION_LABEL } from "../lib/purchaseRequestQuoteAdjustment.constants";
import {
  couponPrecioUnitario,
  couponRawContribution,
  giftTotal,
  projectMargin,
} from "../lib/purchaseRequestQuoteAdjustment.margin";
import AdjustmentMarginPreview from "./AdjustmentMarginPreview";
import AdjustmentMarginModal from "./AdjustmentMarginModal";
import QuoteMarginSummary from "./QuoteMarginSummary";

interface StagedItem {
  key: string;
  action: AdjustmentAction;
  item_type: AdjustmentItemType;
  concept_label: string;
  // bono / descuento
  discount_coupon_id?: number;
  type?: "FIJO" | "PORCENTAJE";
  value?: number;
  has_retention?: boolean;
  concept_code_id?: number;
  // obsequio
  accessory_detail_id?: number;
  approved_accessory_id?: number;
  quantity?: number;
  additional_price?: number;
  previous_precio_unitario?: number;
  /** Aporte de esta línea al delta bruto de margen (soles con IGV; + mejora, − empeora). */
  raw_delta: number;
}

interface Props {
  quote: PurchaseRequestQuoteResource;
  onSuccess: () => void;
  onCancel: () => void;
}

const ACTION_BADGE: Record<AdjustmentAction, string> = {
  create: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  update: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  delete: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
};

function SectionCard({
  step,
  icon: Icon,
  title,
  hint,
  action,
  children,
}: {
  step?: number;
  icon: typeof Tag;
  title: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-card shadow-md p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {step ?? <Icon className="h-4 w-4" />}
          </span>
          <div>
            <p className="text-base font-semibold leading-tight">{title}</p>
            {hint && (
              <p className="mt-0.5 text-xs text-muted-foreground leading-tight">
                {hint}
              </p>
            )}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function AdjustmentRequestForm({
  quote,
  onSuccess,
  onCancel,
}: Props) {
  const { data: conceptsOptions = [] } = useAllConceptDiscountBond();
  const { data: coupons = [], isLoading } = useDiscountCouponsByQuote(quote.id);
  const createAdjustment = useCreateAdjustmentRequest();

  const currentGifts = useMemo(
    () => (quote.accessories ?? []).filter((a) => a.type === "OBSEQUIO"),
    [quote.accessories],
  );

  const [reason, setReason] = useState("");
  const [stagedItems, setStagedItems] = useState<StagedItem[]>([]);
  const [marginModalOpen, setMarginModalOpen] = useState(false);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<
    (typeof coupons)[number] | null
  >(null);
  const [deleteCouponId, setDeleteCouponId] = useState<number | null>(null);

  // Carrocería del modelo de la cotización: fija el precio homologado del accesorio.
  const modelBodyTypeId = quote.body_type_id ?? undefined;

  const [addGiftOpen, setAddGiftOpen] = useState(false);
  const [createAccessoryOpen, setCreateAccessoryOpen] = useState(false);
  const [pendingGiftAccessoryId, setPendingGiftAccessoryId] = useState<
    number | undefined
  >();
  const [editingGift, setEditingGift] = useState<
    (typeof currentGifts)[number] | null
  >(null);
  const [deleteGiftId, setDeleteGiftId] = useState<number | null>(null);
  // Cache de accesorios homologados elegidos en el buscador async, para rotular.
  const [accessoryCache, setAccessoryCache] = useState<
    ApprovedAccesoriesResource[]
  >([]);

  const stagedCouponIds = useMemo(
    () =>
      new Set(
        stagedItems
          .filter((item) => item.discount_coupon_id)
          .map((item) => item.discount_coupon_id),
      ),
    [stagedItems],
  );
  const stagedGiftIds = useMemo(
    () =>
      new Set(
        stagedItems
          .filter((item) => item.accessory_detail_id)
          .map((item) => item.accessory_detail_id),
      ),
    [stagedItems],
  );

  const availableCoupons = coupons.filter(
    (coupon) => !stagedCouponIds.has(coupon.id),
  );
  const availableGifts = currentGifts.filter(
    (gift) => !stagedGiftIds.has(gift.id),
  );

  const salePrice = Number(quote.sale_price) || 0;
  const currencySymbol = quote.doc_type_currency_symbol || "S/";

  // Impacto en el margen recalculado en vivo con cada línea agregada.
  const projection = useMemo(() => {
    const totalRawDelta = stagedItems.reduce(
      (sum, item) => sum + (item.raw_delta ?? 0),
      0,
    );
    return projectMargin(
      {
        baseSellingPrice: Number(quote.base_selling_price) || 0,
        currentMarginAmount: Number(quote.margin_amount) || 0,
        currentMarginPct: Number(quote.margin_pct) || 0,
      },
      totalRawDelta,
    );
  }, [stagedItems, quote.base_selling_price, quote.margin_amount, quote.margin_pct]);

  const resolveAccessoryUnitPrice = (accessoryId: number): number => {
    const acc = accessoryCache.find((a) => a.id === accessoryId);
    if (!acc) return 0;
    const priceRow =
      (acc.prices ?? []).find((p) => p.body_type_id === modelBodyTypeId) ??
      (acc.prices ?? [])[0];
    return Number(priceRow?.price ?? acc.price ?? 0);
  };

  const handleAddCreate = (values: Omit<BonusDiscountRow, "id">) => {
    const precio = couponPrecioUnitario(
      values.isPercentage,
      values.valor,
      salePrice,
    );
    setStagedItems((prev) => [
      ...prev,
      {
        key: `new_${Date.now()}`,
        action: "create",
        item_type: "bonus_discount",
        concept_label: values.concept_label,
        concept_code_id: Number(values.concept_id),
        type: values.isPercentage ? "PORCENTAJE" : "FIJO",
        value: values.valor,
        has_retention: values.hasRetention,
        raw_delta: couponRawContribution(values.isNegative, precio),
      },
    ]);
  };

  const handleEditSubmit = (values: Omit<BonusDiscountRow, "id">) => {
    if (!editingCoupon) return;
    const newPrecio = couponPrecioUnitario(
      values.isPercentage,
      values.valor,
      salePrice,
    );
    const oldContribution = couponRawContribution(
      editingCoupon.is_negative,
      Number(editingCoupon.precio_unitario),
    );
    const newContribution = couponRawContribution(values.isNegative, newPrecio);
    setStagedItems((prev) => [
      ...prev,
      {
        key: `update_${editingCoupon.id}`,
        action: "update",
        item_type: "bonus_discount",
        discount_coupon_id: editingCoupon.id,
        concept_label: values.concept_label,
        concept_code_id: Number(values.concept_id),
        type: values.isPercentage ? "PORCENTAJE" : "FIJO",
        value: values.valor,
        has_retention: values.hasRetention,
        previous_precio_unitario: Number(editingCoupon.precio_unitario),
        raw_delta: newContribution - oldContribution,
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
        item_type: "bonus_discount",
        discount_coupon_id: coupon.id,
        concept_label: coupon.concept_code,
        previous_precio_unitario: Number(coupon.precio_unitario),
        raw_delta: -couponRawContribution(
          coupon.is_negative,
          Number(coupon.precio_unitario),
        ),
      },
    ]);
    setDeleteCouponId(null);
  };

  const accessoryLabel = (accessoryId: number, fallback?: string) =>
    accessoryCache.find((a) => a.id === accessoryId)?.description ??
    fallback ??
    "Obsequio";

  const handleAddGift = (row: Omit<ApprovedAccessoryRow, "id">) => {
    const unit = resolveAccessoryUnitPrice(row.accessory_id);
    const total = giftTotal(row.quantity, unit, row.additional_price ?? 0);
    setStagedItems((prev) => [
      ...prev,
      {
        key: `gift_new_${Date.now()}`,
        action: "create",
        item_type: "gift",
        concept_label: accessoryLabel(row.accessory_id),
        approved_accessory_id: row.accessory_id,
        quantity: row.quantity,
        additional_price: row.additional_price ?? 0,
        raw_delta: -total,
      },
    ]);
  };

  const handleEditGift = (row: Omit<ApprovedAccessoryRow, "id">) => {
    if (!editingGift) return;
    const unit = Number(editingGift.price) || 0;
    const newTotal = giftTotal(row.quantity, unit, row.additional_price ?? 0);
    setStagedItems((prev) => [
      ...prev,
      {
        key: `gift_update_${editingGift.id}`,
        action: "update",
        item_type: "gift",
        accessory_detail_id: editingGift.id,
        approved_accessory_id: row.accessory_id,
        quantity: row.quantity,
        additional_price: row.additional_price ?? 0,
        concept_label: accessoryLabel(row.accessory_id, editingGift.description),
        previous_precio_unitario: Number(editingGift.total),
        raw_delta: -(newTotal - Number(editingGift.total)),
      },
    ]);
    setEditingGift(null);
  };

  const handleConfirmDeleteGift = () => {
    const gift = currentGifts.find((g) => g.id === deleteGiftId);
    if (!gift) return;
    setStagedItems((prev) => [
      ...prev,
      {
        key: `gift_delete_${gift.id}`,
        action: "delete",
        item_type: "gift",
        accessory_detail_id: gift.id,
        concept_label: gift.description,
        previous_precio_unitario: Number(gift.total),
        raw_delta: Number(gift.total),
      },
    ]);
    setDeleteGiftId(null);
  };

  const handleRemoveStaged = (key: string) => {
    setStagedItems((prev) => prev.filter((item) => item.key !== key));
  };

  const handleSubmit = async () => {
    if (stagedItems.length === 0) {
      errorToast("Debe agregar al menos una línea de cambio.");
      return;
    }

    const items: AdjustmentItemPayload[] = stagedItems.map((item) =>
      item.item_type === "gift"
        ? {
            action: item.action,
            item_type: "gift",
            accessory_detail_id: item.accessory_detail_id ?? null,
            approved_accessory_id: item.approved_accessory_id ?? null,
            quantity: item.quantity ?? null,
            additional_price: item.additional_price ?? 0,
          }
        : {
            action: item.action,
            item_type: "bonus_discount",
            discount_coupon_id: item.discount_coupon_id ?? null,
            concept_code_id: item.concept_code_id ?? null,
            type: item.type ?? null,
            value: item.value,
            has_retention: item.has_retention,
          },
    );

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

  const rowActionButtons = (onEdit: () => void, onDelete: () => void) => (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onEdit}
        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10"
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  const addButton = (label: string, onClick: () => void) => (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-1.5 shrink-0"
      onClick={onClick}
    >
      <Plus className="h-4 w-4" />
      {label}
    </Button>
  );

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="space-y-6">
          <SectionCard
            step={1}
            icon={Tag}
            title="Bonos / Descuentos actuales"
            hint="Edita o quita los vigentes, o agrega uno nuevo."
            action={addButton("Agregar", () => setAddSheetOpen(true))}
          >
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Cargando...</p>
            ) : availableCoupons.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay más bonos/descuentos disponibles para editar o eliminar.
              </p>
            ) : (
              <div className="space-y-2">
                {availableCoupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2 text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{coupon.concept_code}</span>
                      <span
                        className={
                          coupon.is_negative
                            ? "text-red-600 dark:text-red-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }
                      >
                        {coupon.is_negative ? "− " : "+ "}
                        {currencySymbol}{" "}
                        <NumberFormat
                          value={Number(coupon.precio_unitario).toFixed(2)}
                        />
                      </span>
                    </div>
                    {rowActionButtons(
                      () => setEditingCoupon(coupon),
                      () => setDeleteCouponId(coupon.id),
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            step={2}
            icon={Gift}
            title="Obsequios actuales"
            hint="Puedes crear el obsequio como accesorio homologado comercial."
            action={addButton("Agregar", () => setAddGiftOpen(true))}
          >
            {availableGifts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay obsequios disponibles para editar o eliminar.
              </p>
            ) : (
              <div className="space-y-2">
                {availableGifts.map((gift) => (
                  <div
                    key={gift.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2 text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{gift.description}</span>
                      <span className="text-muted-foreground text-xs">
                        Cant. {gift.quantity} · Costo {gift.type_currency_symbol}{" "}
                        <NumberFormat value={Number(gift.total).toFixed(2)} />
                      </span>
                    </div>
                    {rowActionButtons(
                      () => setEditingGift(gift),
                      () => setDeleteGiftId(gift.id),
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            step={3}
            icon={ListChecks}
            title="Cambios a solicitar"
            hint="Estas líneas se enviarán a contabilidad para aprobación."
            action={
              stagedItems.length > 0 ? (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {stagedItems.length}
                </span>
              ) : undefined
            }
          >
            {stagedItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aún no has agregado ninguna línea de cambio.
              </p>
            ) : (
              <div className="space-y-2">
                {stagedItems.map((item) => {
                  const positive = item.raw_delta > 0.004;
                  const negative = item.raw_delta < -0.004;
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2 text-sm"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "rounded-md px-1.5 py-0.5 text-[11px] font-semibold uppercase",
                              ACTION_BADGE[item.action],
                            )}
                          >
                            {ADJUSTMENT_ACTION_LABEL[item.action]}
                          </span>
                          <span className="font-medium">
                            {item.item_type === "gift" ? "Obsequio: " : ""}
                            {item.concept_label}
                          </span>
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {item.action !== "delete" &&
                            (item.item_type === "gift" ? (
                              <>Cantidad: {item.quantity} · </>
                            ) : (
                              <>
                                Nuevo valor:{" "}
                                {item.type === "PORCENTAJE" ? "" : currencySymbol}{" "}
                                {item.value}
                                {item.type === "PORCENTAJE" ? "%" : ""} ·{" "}
                              </>
                            ))}
                          <span
                            className={cn(
                              "font-medium",
                              positive &&
                                "text-emerald-600 dark:text-emerald-400",
                              negative && "text-red-600 dark:text-red-400",
                            )}
                          >
                            Margen {positive ? "+" : negative ? "−" : "±"}
                            {currencySymbol}{" "}
                            <NumberFormat
                              value={Math.abs(item.raw_delta / 1.18).toFixed(2)}
                            />
                          </span>
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveStaged(item.key)}
                        className="h-8 w-8 text-muted-foreground hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          <SectionCard
            step={4}
            icon={Edit2}
            title="Motivo del ajuste"
            hint="Opcional — ayuda a contabilidad a revisar más rápido."
          >
            <Textarea
              id="adjustment-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej. Cayó un bono financiero adicional tras la facturación."
              rows={3}
            />
          </SectionCard>

        </div>

        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <AdjustmentMarginPreview
            projection={projection}
            currencySymbol={currencySymbol}
            changeCount={stagedItems.length}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={() => setMarginModalOpen(true)}
          >
            <BarChart3 className="h-4 w-4" />
            Ver detalle del margen
          </Button>

          <QuoteMarginSummary quote={quote} layout="list" />

          <div className="rounded-2xl bg-card shadow-md p-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              {stagedItems.length === 0
                ? "Agrega al menos una línea de cambio."
                : `${stagedItems.length} ${stagedItems.length === 1 ? "cambio listo" : "cambios listos"} para enviar.`}
            </p>
            <Button
              onClick={handleSubmit}
              disabled={createAdjustment.isPending || stagedItems.length === 0}
              className="w-full gap-2"
            >
              {createAdjustment.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  Enviar Solicitud
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>

      <AdjustmentMarginModal
        open={marginModalOpen}
        onOpenChange={setMarginModalOpen}
        projection={projection}
        currencySymbol={currencySymbol}
        lines={stagedItems.map((item) => ({
          key: item.key,
          action: item.action,
          isGift: item.item_type === "gift",
          label: item.concept_label,
          rawDelta: item.raw_delta,
        }))}
      />

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

      <AccesorySheet
        open={addGiftOpen}
        onClose={() => {
          setAddGiftOpen(false);
          setPendingGiftAccessoryId(undefined);
        }}
        onSubmit={handleAddGift}
        accessories={accessoryCache}
        rows={[]}
        lockPaidAccessories
        modelBodyTypeId={modelBodyTypeId}
        initialAccessoryId={pendingGiftAccessoryId}
        canCreateApprovedAccessory
        onOpenCreateModal={() => setCreateAccessoryOpen(true)}
        onRegisterAccessory={(acc) =>
          setAccessoryCache((prev) =>
            prev.some((a) => a.id === acc.id) ? prev : [...prev, acc],
          )
        }
      />

      <CreateApprovedAccessoryModal
        open={createAccessoryOpen}
        defaultBodyTypeId={modelBodyTypeId}
        onClose={() => setCreateAccessoryOpen(false)}
        onCreated={(acc) =>
          setAccessoryCache((prev) =>
            prev.some((a) => a.id === acc.id) ? prev : [...prev, acc],
          )
        }
        onSuccess={(accessoryId) => {
          setPendingGiftAccessoryId(accessoryId);
          setAddGiftOpen(true);
        }}
      />

      <AccesorySheet
        open={!!editingGift}
        onClose={() => setEditingGift(null)}
        onSubmit={handleEditGift}
        accessories={accessoryCache}
        rows={[]}
        lockPaidAccessories
        modelBodyTypeId={modelBodyTypeId}
        editingRow={
          editingGift
            ? {
                id: String(editingGift.id),
                accessory_id: editingGift.approved_accessory_id,
                quantity: editingGift.quantity,
                type: "OBSEQUIO",
                additional_price: Number(editingGift.additional_price) || 0,
              }
            : undefined
        }
        onRegisterAccessory={(acc) =>
          setAccessoryCache((prev) =>
            prev.some((a) => a.id === acc.id) ? prev : [...prev, acc],
          )
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

      {deleteGiftId !== null && (
        <ConfirmationDialog
          trigger={<span className="hidden" />}
          title="¿Marcar este obsequio para eliminar?"
          description="Se incluirá en la solicitud de ajuste como una eliminación. El cambio real solo se aplicará si contabilidad lo aprueba."
          confirmText="Sí, marcar para eliminar"
          cancelText="Cancelar"
          onConfirm={handleConfirmDeleteGift}
          variant="destructive"
          icon="warning"
          open={true}
          onOpenChange={(nextOpen) => !nextOpen && setDeleteGiftId(null)}
        />
      )}
    </>
  );
}

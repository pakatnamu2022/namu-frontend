import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  XCircle,
  Pencil,
  Tag,
  Trash2,
  Undo2,
  GripVertical,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { OrderQuotationDetailsResource } from "../lib/proformaDetails.interface";
import { ITEM_TYPE_PRODUCT } from "../lib/proformaDetails.constants";
import { DiscountRequestOrderQuotationResource } from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/lib/discountRequestMeson.interface";
import {
  STATUS_APPROVED,
  STATUS_PENDING,
  STATUS_REJECTED,
  TYPE_PARTIAL,
} from "@/features/ap/post-venta/repuestos/descuento-cotizacion-meson/lib/discountRequestMeson.constants";
import React from "react";

export interface QuotationItemColumn {
  header: string;
  className?: string;
  mobileLabel?: string;
  render: (detail: OrderQuotationDetailsResource) => React.ReactNode;
}

interface QuotationItemsTableProps {
  details: OrderQuotationDetailsResource[];
  isLoading: boolean;
  emptyIcon: React.ReactNode;
  emptyMessage: string;
  formatCurrency: (v: string | number | null | undefined) => string;
  discountRequests: DiscountRequestOrderQuotationResource[];
  globalRequest: DiscountRequestOrderQuotationResource | undefined;
  permissions: {
    canEditDiscount: boolean;
    canApprove: boolean;
    canReject: boolean;
    canRequest: boolean;
    canRemoveSparePartQuote?: boolean;
    canRemoveSparePartLabor: boolean;
    canReverseDiscount?: boolean;
  };
  /** Tipo de ítem de la tabla: determina qué permiso habilita el botón de eliminar */
  itemType: string;
  isApproving: boolean;
  isRejecting: boolean;
  isReverting?: boolean;
  onDelete: (id: number) => Promise<void>;
  onOpenCreate: (
    type: "GLOBAL" | "PARTIAL",
    detail?: OrderQuotationDetailsResource,
  ) => void;
  onOpenEdit: (
    request: DiscountRequestOrderQuotationResource,
    detail?: OrderQuotationDetailsResource,
  ) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onRevert?: (id: number, reason?: string) => void;
  /** Abre el sheet de edición para el ítem (lápiz). Si no se provee, no se muestra el botón. */
  onEditDetail?: (detail: OrderQuotationDetailsResource) => void;
  /** Activa el modo "ordenar": muestra drag handles y desactiva las demás acciones */
  sortable?: boolean;
  /** Se dispara al soltar una fila arrastrada, con los ids ya en el nuevo orden */
  onReorder?: (orderedIds: number[]) => void;
  /** Columnas extra insertadas entre "% Desc." y "Total" — sólo desktop */
  extraColumns?: QuotationItemColumn[];
  /** Campos extra renderizados en la vista móvil de cada ítem */
  extraMobileFields?: (
    detail: OrderQuotationDetailsResource,
  ) => React.ReactNode;
  /** Renderiza el contenido de la primera columna (nombre/código) */
  renderName: (detail: OrderQuotationDetailsResource) => React.ReactNode;
  /** Qué valor muestra la columna "Total" */
  getTotal: (detail: OrderQuotationDetailsResource) => string | number | null;
  /** Qué valor muestra la columna "Cant." */
  getQuantity: (detail: OrderQuotationDetailsResource) => React.ReactNode;
  /** Qué valor muestra la columna "Precio" */
  getPrice: (detail: OrderQuotationDetailsResource) => React.ReactNode;
}

function DiscountRequestBadge({
  request,
  detail,
  permissions,
  isApproving,
  isRejecting,
  isReverting,
  onApprove,
  onReject,
  onRevert,
  onOpenEdit,
}: {
  request: DiscountRequestOrderQuotationResource;
  detail?: OrderQuotationDetailsResource;
  permissions: QuotationItemsTableProps["permissions"];
  isApproving: boolean;
  isRejecting: boolean;
  isReverting?: boolean;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onRevert?: (id: number, reason?: string) => void;
  onOpenEdit: (
    r: DiscountRequestOrderQuotationResource,
    d?: OrderQuotationDetailsResource,
  ) => void;
}) {
  const [revertReason, setRevertReason] = useState("");

  const color =
    request.status === STATUS_APPROVED
      ? "green"
      : request.status === STATUS_REJECTED
        ? "red"
        : "orange";
  const label =
    request.status === STATUS_APPROVED
      ? "Aprobado"
      : request.status === STATUS_REJECTED
        ? "Rechazado"
        : "Pendiente";

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <span className="text-xs font-semibold tabular-nums">
        {Number(request.requested_discount_percentage).toFixed(2)}%
      </span>
      <Badge color={color}>{label}</Badge>
      {request.status === STATUS_PENDING && (
        <>
          {permissions.canApprove && (
            <ConfirmationDialog
              trigger={
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7 text-green-600 hover:text-green-600 hover:bg-green-50"
                  tooltip="Aprobar"
                  disabled={isApproving}
                >
                  <CheckCircle className="size-4" />
                </Button>
              }
              title="¿Aprobar solicitud?"
              description="Se aprobará el descuento solicitado. ¿Deseas continuar?"
              confirmText="Sí, aprobar"
              cancelText="Cancelar"
              icon="info"
              onConfirm={() => onApprove(request.id)}
            />
          )}
          {permissions.canEditDiscount && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              tooltip="Editar"
              onClick={() => onOpenEdit(request, detail)}
            >
              <Pencil className="size-4" />
            </Button>
          )}
          {permissions.canReject && (
            <ConfirmationDialog
              trigger={
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                  tooltip="Rechazar"
                  disabled={isRejecting}
                >
                  <XCircle className="size-4" />
                </Button>
              }
              title="¿Rechazar solicitud?"
              description="Se rechazará el descuento solicitado. ¿Deseas continuar?"
              confirmText="Sí, rechazar"
              cancelText="Cancelar"
              variant="destructive"
              icon="danger"
              onConfirm={() => onReject(request.id)}
            />
          )}
        </>
      )}
      {request.status === STATUS_APPROVED &&
        permissions.canReverseDiscount &&
        onRevert && (
          <ConfirmationDialog
            trigger={
              <Button
                variant="outline"
                size="icon"
                className="size-7 text-amber-600 hover:text-amber-600 hover:bg-amber-50"
                tooltip="Revertir aprobación"
                disabled={isReverting}
              >
                <Undo2 className="size-4" />
              </Button>
            }
            title="¿Revertir descuento aprobado?"
            description="Se revertirá la aprobación del descuento solicitado. Puedes indicar un motivo (opcional)."
            confirmText="Sí, revertir"
            cancelText="Cancelar"
            variant="destructive"
            icon="warning"
            onConfirm={() => {
              onRevert(request.id, revertReason.trim() || undefined);
              setRevertReason("");
            }}
          >
            <div className="space-y-1.5">
              <Label
                htmlFor={`revert-reason-${request.id}`}
                className="text-xs"
              >
                Motivo (opcional)
              </Label>
              <Textarea
                id={`revert-reason-${request.id}`}
                value={revertReason}
                onChange={(e) => setRevertReason(e.target.value)}
                placeholder="Ej: Se corrigió el porcentaje por error de digitación"
                className="text-sm"
                rows={3}
              />
            </div>
          </ConfirmationDialog>
        )}
    </div>
  );
}

export function QuotationItemsTable({
  details,
  isLoading,
  emptyIcon,
  emptyMessage,
  formatCurrency,
  discountRequests,
  globalRequest,
  permissions,
  itemType,
  isApproving,
  isRejecting,
  isReverting,
  onDelete,
  onOpenCreate,
  onOpenEdit,
  onApprove,
  onReject,
  onRevert,
  onEditDetail,
  sortable = false,
  onReorder,
  extraColumns = [],
  extraMobileFields,
  renderName,
  getTotal,
  getQuantity,
  getPrice,
}: QuotationItemsTableProps) {
  const canRemove =
    itemType === ITEM_TYPE_PRODUCT
      ? !!permissions.canRemoveSparePartQuote
      : permissions.canRemoveSparePartLabor;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = details.findIndex((d) => d.id === active.id);
    const newIndex = details.findIndex((d) => d.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(details, oldIndex, newIndex);
    onReorder?.(reordered.map((d) => d.id));
  };

  const getPartialRequest = (detailId: number) =>
    discountRequests.find(
      (r) =>
        r.type === TYPE_PARTIAL && r.ap_order_quotation_detail_id === detailId,
    );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (details.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 border rounded-lg bg-muted/30 gap-2">
        <span className="text-muted-foreground/50">{emptyIcon}</span>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      {/* ── DESKTOP ── */}
      <div className="hidden md:block overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/60 border-b text-xs font-semibold text-muted-foreground">
                {sortable && <th className="px-2 py-2.5 w-8" />}
                <th className="px-3 py-2.5 text-left w-[28%]">Descripción</th>
                <th className="px-3 py-2.5 text-center w-[8%]">Cant.</th>
                <th className="px-3 py-2.5 text-center w-[12%]">Precio</th>
                <th className="px-3 py-2.5 text-center w-[9%]">% Desc.</th>
                {extraColumns.map((col, i) => (
                  <th
                    key={i}
                    className={`px-3 py-2.5 text-center ${col.className ?? ""}`}
                  >
                    {col.header}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-center w-[12%]">Cto. Neto</th>
                <th className="px-3 py-2.5 text-right">Acciones</th>
              </tr>
            </thead>
            <SortableContext
              items={details.map((d) => d.id)}
              strategy={verticalListSortingStrategy}
            >
              <tbody className="divide-y">
                {details.map((detail) => {
                  const partialRequest = getPartialRequest(detail.id);
                  const approvedRequest =
                    partialRequest?.status === STATUS_APPROVED
                      ? partialRequest
                      : globalRequest?.status === STATUS_APPROVED
                        ? globalRequest
                        : null;

                  return (
                    <QuotationItemRow
                      key={detail.id}
                      detail={detail}
                      sortable={sortable}
                    >
                      <td className="px-3 py-2.5 align-top">
                        {renderName(detail)}
                      </td>

                      <td className="px-3 py-2.5 text-center align-middle">
                        {getQuantity(detail)}
                      </td>

                      <td className="px-3 py-2.5 text-center align-middle font-medium">
                        {getPrice(detail)}
                      </td>

                      <td className="px-3 py-2.5 text-center align-middle">
                        {approvedRequest ? (
                          <span className="text-green-600 font-semibold tabular-nums">
                            -{detail.discount_percentage}%
                          </span>
                        ) : (
                          <span className="tabular-nums">
                            {Number(detail.discount_percentage || 0).toFixed(
                              2,
                            )}
                            %
                          </span>
                        )}
                      </td>

                      {extraColumns.map((col, i) => (
                        <td
                          key={i}
                          className={`px-3 py-2.5 text-center align-middle ${col.className ?? ""}`}
                        >
                          {col.render(detail)}
                        </td>
                      ))}

                      <td className="px-3 py-2.5 text-center align-middle font-bold text-primary tabular-nums">
                        {formatCurrency(getTotal(detail))}
                      </td>

                      <td className="px-3 py-2.5 text-right align-middle">
                        {!sortable && (
                          <div className="flex items-center justify-end gap-1">
                            {partialRequest ? (
                              <DiscountRequestBadge
                                request={partialRequest}
                                detail={detail}
                                permissions={permissions}
                                isApproving={isApproving}
                                isRejecting={isRejecting}
                                isReverting={isReverting}
                                onApprove={onApprove}
                                onReject={onReject}
                                onRevert={onRevert}
                                onOpenEdit={onOpenEdit}
                              />
                            ) : (
                              permissions.canRequest &&
                              !globalRequest && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="size-7"
                                  tooltip="Solicitar descuento parcial"
                                  onClick={() => onOpenCreate("PARTIAL", detail)}
                                >
                                  <Tag className="size-4" />
                                </Button>
                              )
                            )}

                            {onEditDetail && (
                              <Button
                                variant="outline"
                                size="icon"
                                className="size-7"
                                tooltip="Editar"
                                onClick={() => onEditDetail(detail)}
                              >
                                <Pencil className="size-4" />
                              </Button>
                            )}

                            {canRemove && (
                              <Button
                                variant="ghost"
                                color="red"
                                size="icon"
                                className="size-7 border"
                                onClick={() => onDelete(detail.id)}
                                tooltip="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    </QuotationItemRow>
                  );
                })}
              </tbody>
            </SortableContext>
          </table>
        </DndContext>
      </div>

      {/* ── MOBILE ── */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={details.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="md:hidden divide-y">
            {details.map((detail) => {
              const partialRequest = getPartialRequest(detail.id);
              const approvedRequest =
                partialRequest?.status === STATUS_APPROVED
                  ? partialRequest
                  : globalRequest?.status === STATUS_APPROVED
                    ? globalRequest
                    : null;

              return (
                <QuotationItemCard
                  key={detail.id}
                  detail={detail}
                  sortable={sortable}
                >
                  {/* Fila superior: nombre + acciones */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">{renderName(detail)}</div>
                    {!sortable && (
                      <div className="flex items-center gap-1 shrink-0">
                        {onEditDetail && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => onEditDetail(detail)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        )}
                        {canRemove && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onDelete(detail.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Grid de datos */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Cant.:</span>
                      <span className="font-medium">{getQuantity(detail)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Precio:</span>
                      <span className="font-medium">{getPrice(detail)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Desc.:</span>
                      {approvedRequest ? (
                        <span className="font-semibold text-green-600 tabular-nums">
                          -{detail.discount_percentage}%
                        </span>
                      ) : (
                        <span className="font-medium tabular-nums">
                          {Number(detail.discount_percentage || 0).toFixed(2)}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-bold text-primary tabular-nums">
                        {formatCurrency(getTotal(detail))}
                      </span>
                    </div>

                    {/* Campos extra del modo específico (ej: Tipo Abas., Reg. por) */}
                    {extraMobileFields?.(detail)}
                  </div>

                  {/* Sección descuento parcial */}
                  {!sortable && !globalRequest && (
                    <div className="pt-1 border-t border-dashed">
                      {partialRequest ? (
                        <DiscountRequestBadge
                          request={partialRequest}
                          detail={detail}
                          permissions={permissions}
                          isApproving={isApproving}
                          isRejecting={isRejecting}
                          isReverting={isReverting}
                          onApprove={onApprove}
                          onReject={onReject}
                          onRevert={onRevert}
                          onOpenEdit={onOpenEdit}
                        />
                      ) : (
                        permissions.canRequest && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs h-7"
                            onClick={() => onOpenCreate("PARTIAL", detail)}
                          >
                            <Tag className="size-3.5" />
                            Solicitar desc. parcial
                          </Button>
                        )
                      )}
                    </div>
                  )}
                </QuotationItemCard>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

/** Envuelve una <tr> con soporte de drag-and-drop cuando `sortable` está activo. */
function QuotationItemRow({
  detail,
  sortable,
  children,
}: {
  detail: OrderQuotationDetailsResource;
  sortable: boolean;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: detail.id, disabled: !sortable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-muted/20 transition-colors ${isDragging ? "z-10 bg-muted/40 opacity-80" : ""}`}
    >
      {sortable && (
        <td className="px-2 py-2.5 align-middle">
          <button
            type="button"
            className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
        </td>
      )}
      {children}
    </tr>
  );
}

/** Envuelve una tarjeta móvil con soporte de drag-and-drop cuando `sortable` está activo. */
function QuotationItemCard({
  detail,
  sortable,
  children,
}: {
  detail: OrderQuotationDetailsResource;
  sortable: boolean;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: detail.id, disabled: !sortable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 space-y-2 ${isDragging ? "z-10 bg-muted/40 opacity-80" : ""}`}
    >
      {sortable && (
        <button
          type="button"
          className="mb-1 flex items-center gap-1 text-xs text-muted-foreground cursor-grab touch-none active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
          Mantén presionado para arrastrar
        </button>
      )}
      {children}
    </div>
  );
}

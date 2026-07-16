import { useState, useRef, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Eye, Info, Package, Plus, RefreshCw } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  ElectronicDocumentSchema,
  ElectronicDocumentItemSchema,
} from "../../lib/electronicDocument.schema";
import { SunatConceptsResource } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.interface";
import { UNIT_MEASURES } from "../../lib/electronicDocument.constants";
import { ElectronicDocumentItemsTable } from "../ElectronicDocumentItemsTable";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { useAllAccountingAccountPlan } from "@/features/ap/configuraciones/maestros-general/plan-cuenta-contable/lib/accountingAccountPlan.hook";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { errorToast } from "@/core/core.function";
import { FormInput } from "@/shared/components/FormInput";
import { ACP_TYPE_SALE } from "@/features/ap/configuraciones/maestros-general/plan-cuenta-contable/lib/accountingAccountPlan.constants";
import {
  QUOTATION_ACCOUNT_PLAN_IDS,
  NUBEFACT_CODES,
} from "../../lib/electronicDocument.constants";

interface ItemsSectionProps {
  form: UseFormReturn<ElectronicDocumentSchema>;
  igvTypes: SunatConceptsResource[];
  currencySymbol: string;
  porcentaje_de_igv: number;
  isAdvancePayment?: boolean;
  maxAdvanceAmount?: number;
  isFromQuotation?: boolean;
  showActions?: boolean;
  useQuotation?: boolean;
  isDetraction?: boolean;
  minRetentionPrice?: number;
  allowEditLastItemDescription?: boolean;
  isCommercial?: boolean;
  // Acciones para ver/editar o refrescar el modelo del vehículo de la venta
  // final directamente desde aquí, sin salir del documento electrónico
  showVehicleModelActions?: boolean;
  onOpenVehicleModel?: () => void;
  onRefreshVehicleModel?: () => void;
  isRefreshingVehicleModel?: boolean;
  // Modo de IGV del comprobante, definido por Caja a nivel de documento (no por item).
  // "normal": items gravados con IGV (comportamiento actual). "inafecta": items sin IGV.
  igvMode?: "normal" | "inafecta";
}

export function ItemsSection({
  form,
  igvTypes,
  currencySymbol,
  porcentaje_de_igv,
  isAdvancePayment = false,
  maxAdvanceAmount,
  isFromQuotation = false,
  showActions = true,
  useQuotation = false,
  isDetraction = false,
  minRetentionPrice,
  allowEditLastItemDescription = false,
  isCommercial = true,
  showVehicleModelActions = false,
  onOpenVehicleModel,
  onRefreshVehicleModel,
  isRefreshingVehicleModel = false,
  igvMode = "normal",
}: ItemsSectionProps) {
  const { data: accountPlans } = useAllAccountingAccountPlan({
    ...(isAdvancePayment ? {} : { is_detraction: isDetraction ? 1 : 0 }),
    type: ACP_TYPE_SALE,
    ...(isCommercial ? { enable_commercial: 1 } : { enable_after_sales: 1 }),
  });

  // Validate existing items when detraction mode changes
  const lastValidatedForDetraction = useRef<boolean | null>(null);
  useEffect(() => {
    if (!accountPlans || lastValidatedForDetraction.current === isDetraction)
      return;

    if (lastValidatedForDetraction.current === null) {
      lastValidatedForDetraction.current = isDetraction;
      return;
    }

    lastValidatedForDetraction.current = isDetraction;

    const currentItems = form.getValues("items") || [];
    if (currentItems.length === 0) return;

    const validPlanIds = new Set(accountPlans.map((p) => p.id.toString()));
    const hasInvalidItems = currentItems.some(
      (item) => !validPlanIds.has(item.account_plan_id?.toString()),
    );

    if (hasInvalidItems) {
      const validItems = currentItems.filter((item) =>
        validPlanIds.has(item.account_plan_id?.toString()),
      );
      form.setValue("items", validItems, { shouldValidate: true });
      errorToast(
        "Se eliminaron items con un plan contable no válido para el tipo de operación seleccionado.",
      );
    }
  }, [isDetraction, accountPlans]);

  const emptyNewItem = {
    unidad_de_medida: "NIU",
    descripcion: "",
    cantidad: 1,
    precio_unitario: 0,
    descuento: 0,
    account_plan_id: "",
    anticipo_documento_serie: "",
    anticipo_documento_numero: "",
  };

  // Tipo de IGV a aplicar a los items nuevos/editados, según el modo elegido por Caja.
  const activeIgvTypeCode =
    igvMode === "inafecta"
      ? NUBEFACT_CODES.INAFECTA_ONEROSA
      : NUBEFACT_CODES.GRAVADA_ONEROSA;
  const activeIgvType = igvTypes.find(
    (t) => t.code_nubefact === activeIgvTypeCode,
  );
  const chargesIgv = igvMode !== "inafecta";

  const [newItem, setNewItem] = useState(emptyNewItem);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const items = form.watch("items") || [];
  const isAddItemDisabled =
    isFromQuotation || (isAdvancePayment && items.length >= 1);

  // Cuenta contable de anticipo seleccionada libremente (no proviene de una cotización)
  const isFreeAdvanceAccount =
    !isFromQuotation &&
    !isAdvancePayment &&
    newItem.account_plan_id === QUOTATION_ACCOUNT_PLAN_IDS.ADVANCE_PAYMENT;

  // Auto-expand textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [newItem.descripcion]);

  const openSheetForNewItem = () => {
    setNewItem(emptyNewItem);
    setEditingIndex(null);
    setIsSheetOpen(true);
  };

  const addItem = () => {
    if (
      !newItem.descripcion ||
      newItem.precio_unitario <= 0 ||
      !newItem.account_plan_id
    )
      return;

    // Si es anticipo, solo permitir una línea
    if (isAdvancePayment && items.length >= 1) {
      return;
    }

    // Calcular valores según SUNAT:
    // Ejemplo: precio_unitario (con IGV) = 590, descuento = 200
    // 1. valor_unitario = precio sin IGV = 590 / 1.18 = 500
    // 2. precio_unitario = precio con IGV = 590
    // 3. descuento = 200 (se aplica sobre el valor_unitario)
    // 4. subtotal = (valor_unitario * cantidad) - descuento = 500 - 200 = 300
    // 5. igv = subtotal * 0.18 = 300 * 0.18 = 54
    // 6. total = subtotal + igv = 300 + 54 = 354
    // Cuando el item no cobra IGV (inafecto/exonerado/gratuito): valor_unitario = precio_unitario,
    // igv = 0 y total = subtotal.
    const precio_con_igv_input = newItem.precio_unitario; // Lo que ingresa el usuario (CON IGV)
    const descuento = newItem.descuento || 0;
    const valor_unitario = chargesIgv
      ? precio_con_igv_input / (1 + porcentaje_de_igv / 100)
      : precio_con_igv_input;
    const precio_unitario = precio_con_igv_input; // Precio CON IGV (sin descuento aplicado)
    const subtotal = valor_unitario * newItem.cantidad - descuento;
    const igv = chargesIgv ? subtotal * (porcentaje_de_igv / 100) : 0;
    const total = subtotal + igv;

    // Validar que el total no exceda el máximo permitido para anticipos
    if (isAdvancePayment && maxAdvanceAmount && total > maxAdvanceAmount) {
      errorToast(
        `El monto del anticipo no puede exceder ${currencySymbol} ${maxAdvanceAmount.toFixed(
          2,
        )}`,
      );
      return;
    }

    // Validar precio mínimo por retención
    if (minRetentionPrice && newItem.precio_unitario < minRetentionPrice) {
      errorToast(
        `El precio unitario no puede ser menor a ${currencySymbol} ${minRetentionPrice.toFixed(2)} (mínimo de retención S/ 700)`,
      );
      return;
    }

    // Validar serie y número cuando el item corresponde a un anticipo agregado libremente
    if (isFreeAdvanceAccount) {
      if (
        !newItem.anticipo_documento_serie ||
        !newItem.anticipo_documento_numero
      ) {
        errorToast(
          "Debe indicar la serie y el número del anticipo para esta cuenta contable.",
        );
        return;
      }
    }

    const item: ElectronicDocumentItemSchema = {
      unidad_de_medida: newItem.unidad_de_medida,
      descripcion: newItem.descripcion,
      cantidad: newItem.cantidad,
      valor_unitario: valor_unitario,
      precio_unitario: precio_unitario,
      descuento: descuento > 0 ? descuento : undefined,
      subtotal: subtotal,
      sunat_concept_igv_type_id: activeIgvType?.id || 0,
      igv: igv,
      total: total,
      account_plan_id: newItem.account_plan_id.toString(),
      anticipo_regularizacion: isAdvancePayment
        ? false
        : isFreeAdvanceAccount
          ? true
          : undefined,
      anticipo_documento_serie: isFreeAdvanceAccount
        ? newItem.anticipo_documento_serie
        : undefined,
      anticipo_documento_numero: isFreeAdvanceAccount
        ? Number(newItem.anticipo_documento_numero)
        : undefined,
    };

    form.setValue("items", [...items, item], { shouldValidate: true });
    setIsSheetOpen(false);
    setNewItem(emptyNewItem);
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    form.setValue("items", updatedItems, { shouldValidate: true });
    setEditingIndex(null);
  };

  const editItem = (index: number) => {
    const item = items[index];
    setNewItem({
      unidad_de_medida: item.unidad_de_medida,
      descripcion: item.descripcion,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      descuento: item.descuento || 0,
      account_plan_id: item.account_plan_id.toString(),
      anticipo_documento_serie: item.anticipo_documento_serie || "",
      anticipo_documento_numero: item.anticipo_documento_numero
        ? item.anticipo_documento_numero.toString()
        : "",
    });
    setEditingIndex(index);
    setIsSheetOpen(true);
  };

  const updateItem = () => {
    if (editingIndex === null || !newItem.descripcion) return;

    // En modo edición de solo descripción, solo actualizamos ese campo (no aplica en anticipo)
    if (allowEditLastItemDescription && !isAdvancePayment) {
      const updatedItems = [...items];
      updatedItems[editingIndex] = {
        ...updatedItems[editingIndex],
        descripcion: newItem.descripcion,
      };
      form.setValue("items", updatedItems, { shouldValidate: true });
      setIsSheetOpen(false);
      setNewItem(emptyNewItem);
      setEditingIndex(null);
      return;
    }

    if (newItem.precio_unitario <= 0 || !newItem.account_plan_id) return;

    const precio_con_igv_input = newItem.precio_unitario; // Lo que ingresa el usuario (CON IGV)
    const descuento = newItem.descuento || 0;
    const valor_unitario = chargesIgv
      ? precio_con_igv_input / (1 + porcentaje_de_igv / 100)
      : precio_con_igv_input;
    const precio_unitario = precio_con_igv_input; // Precio CON IGV (sin descuento aplicado)
    const subtotal = valor_unitario * newItem.cantidad - descuento;
    const igv = chargesIgv ? subtotal * (porcentaje_de_igv / 100) : 0;
    const total = subtotal + igv;

    // Validar que el total no exceda el máximo permitido para anticipos
    if (
      isAdvancePayment &&
      maxAdvanceAmount &&
      Number(total.toFixed(2)) > Number(maxAdvanceAmount.toFixed(2))
    ) {
      errorToast(
        `El monto del anticipo no puede exceder ${currencySymbol} ${maxAdvanceAmount.toFixed(
          2,
        )}`,
      );
      return;
    }

    // Validar precio mínimo por retención
    if (minRetentionPrice && newItem.precio_unitario < minRetentionPrice) {
      errorToast(
        `El precio unitario no puede ser menor a ${currencySymbol} ${minRetentionPrice.toFixed(2)} (mínimo de retención S/ 700)`,
      );
      return;
    }

    // Validar serie y número cuando el item corresponde a un anticipo agregado libremente
    if (isFreeAdvanceAccount) {
      if (
        !newItem.anticipo_documento_serie ||
        !newItem.anticipo_documento_numero
      ) {
        errorToast(
          "Debe indicar la serie y el número del anticipo para esta cuenta contable.",
        );
        return;
      }
    }

    const updatedItem: ElectronicDocumentItemSchema = {
      ...items[editingIndex],
      unidad_de_medida: newItem.unidad_de_medida,
      descripcion: newItem.descripcion,
      cantidad: newItem.cantidad,
      valor_unitario: valor_unitario,
      precio_unitario: precio_unitario,
      descuento: descuento > 0 ? descuento : undefined,
      subtotal: subtotal,
      sunat_concept_igv_type_id: activeIgvType?.id || 0,
      igv: igv,
      total: total,
      account_plan_id: newItem.account_plan_id,
      anticipo_regularizacion: isFreeAdvanceAccount ? true : undefined,
      anticipo_documento_serie: isFreeAdvanceAccount
        ? newItem.anticipo_documento_serie
        : undefined,
      anticipo_documento_numero: isFreeAdvanceAccount
        ? Number(newItem.anticipo_documento_numero)
        : undefined,
    };

    const updatedItems = [...items];
    updatedItems[editingIndex] = updatedItem;
    form.setValue("items", updatedItems, { shouldValidate: true });

    setIsSheetOpen(false);
    setNewItem(emptyNewItem);
    setEditingIndex(null);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setNewItem(emptyNewItem);
    setEditingIndex(null);
  };

  const handleSaveItem = () => {
    if (editingIndex !== null) {
      updateItem();
    } else {
      addItem();
    }
  };

  return (
    <>
      <GroupFormSection
        title="Items"
        icon={Package}
        color="primary"
        cols={{ sm: 1 }}
        gap="gap-1"
      >
        <div className="flex items-end justify-between gap-4">
          {showVehicleModelActions && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={onOpenVehicleModel}
                title="Ver o editar el modelo del vehículo"
              >
                <Eye className="size-4" />
                Ver/Editar Modelo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={onRefreshVehicleModel}
                disabled={isRefreshingVehicleModel}
                title="Refrescar los datos del modelo en este item"
              >
                <RefreshCw
                  className={`size-4 ${isRefreshingVehicleModel ? "animate-spin" : ""}`}
                />
                Refrescar Datos
              </Button>
            </div>
          )}
          {isAdvancePayment && (
            <Alert className="text-sm p-2 w-fit">
              <AlertTitle className="flex items-center gap-2">
                <Info className="size-5" />
                Modo Anticipo: Solo puede agregar una línea.
              </AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground">
                {maxAdvanceAmount &&
                  ` Máximo permitido: ${currencySymbol} ${maxAdvanceAmount.toFixed(
                    2,
                  )}`}
              </AlertDescription>
            </Alert>
          )}
          {!useQuotation && (
            <Button
              type="button"
              onClick={openSheetForNewItem}
              disabled={isAddItemDisabled}
              className={isFromQuotation ? "hidden" : "gap-2"}
              size="sm"
            >
              <Plus className="size-4" />
              Agregar Item
            </Button>
          )}
        </div>

        {form.formState.errors.items && (
          <p className="text-sm font-medium text-destructive mb-2">
            {form.formState.errors.items.message}
          </p>
        )}

        <ElectronicDocumentItemsTable
          items={items}
          currencySymbol={currencySymbol}
          onRemoveItem={removeItem}
          onEditItem={editItem}
          isAdvancePayment={isAdvancePayment}
          showActions={showActions}
          canRemoveItem={!useQuotation}
          allowEditLastItemDescription={allowEditLastItemDescription}
          allowEditAdvanceItems={!isFromQuotation}
        />
      </GroupFormSection>

      <GeneralSheet
        open={isSheetOpen}
        onClose={closeSheet}
        title={editingIndex !== null ? "Editar Item" : "Agregar Item"}
        side="right"
        className="max-w-lg!"
        modal={false}
        icon={editingIndex !== null ? "Pencil" : "Plus"}
      >
        <div className="flex flex-col gap-4">
          <div className="flex-1 space-y-4">
            {igvMode === "inafecta" && (
              <Alert className="text-sm p-2">
                <AlertTitle className="flex items-center gap-2">
                  <Info className="size-5" />
                  Comprobante Inafecto a IGV
                </AlertTitle>
                <AlertDescription className="text-xs text-muted-foreground">
                  Este item se registrará sin IGV (precio ingresado = precio
                  final).
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="item-description">Descripción *</Label>
              <Textarea
                ref={textareaRef}
                id="item-description"
                placeholder="Descripción del producto/servicio"
                className="min-h-[100px] resize-none uppercase"
                value={newItem.descripcion}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    descripcion: e.target.value.toUpperCase(),
                  })
                }
                onInput={adjustTextareaHeight}
              />
            </div>

            {!(
              allowEditLastItemDescription &&
              editingIndex !== null &&
              !isAdvancePayment
            ) && (
              <>
                <div className="flex flex-col gap-2">
                  <SearchableSelect
                    label="Unidad de Medida *"
                    onChange={(value) =>
                      setNewItem({ ...newItem, unidad_de_medida: value })
                    }
                    value={newItem.unidad_de_medida}
                    options={UNIT_MEASURES.map((unit) => ({
                      value: unit.value,
                      label: unit.label,
                    }))}
                    className="w-full!"
                    buttonSize="default"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <SearchableSelect
                    label="Plan de Cuenta Contable *"
                    onChange={(value) =>
                      setNewItem({ ...newItem, account_plan_id: value })
                    }
                    value={newItem.account_plan_id}
                    options={
                      accountPlans?.map((plan) => ({
                        value: plan.id.toString(),
                        label: `${plan.account} - ${plan.description}`,
                      })) || []
                    }
                    className="w-full!"
                    buttonSize="default"
                    disabled={isFromQuotation}
                  />
                </div>

                {isFreeAdvanceAccount && (
                  <Alert className="text-sm p-2">
                    <AlertTitle className="flex items-center gap-2">
                      <Info className="size-5" />
                      Este item se registrará como Anticipo
                    </AlertTitle>
                    <AlertDescription className="text-xs text-muted-foreground">
                      Indique la serie y el número del documento de anticipo
                      asociado.
                    </AlertDescription>
                  </Alert>
                )}

                {isFreeAdvanceAccount && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="item-anticipo-serie">Serie *</Label>
                      <Input
                        id="item-anticipo-serie"
                        placeholder="Ej: F001"
                        maxLength={4}
                        value={newItem.anticipo_documento_serie}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            anticipo_documento_serie:
                              e.target.value.toUpperCase(),
                          })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="item-anticipo-numero">
                        Correlativo *
                      </Label>
                      <Input
                        id="item-anticipo-numero"
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Ej: 123"
                        value={newItem.anticipo_documento_numero}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            anticipo_documento_numero: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Label htmlFor="item-quantity">Cantidad *</Label>
                  <Input
                    id="item-quantity"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItem.cantidad}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        cantidad: parseFloat(e.target.value) || 1,
                      })
                    }
                    disabled={isFromQuotation}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <FormInput
                    name="item-price"
                    label="Precio Unitario (Con IGV)"
                    placeholder="Ej: 580.00"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItem.precio_unitario}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        precio_unitario: parseFloat(e.target.value) || 0,
                      })
                    }
                    disabled={isFromQuotation && !isAdvancePayment}
                  />
                  {minRetentionPrice && (
                    <p className="text-xs text-muted-foreground">
                      Mínimo por retención:{" "}
                      <span className="font-medium">
                        {currencySymbol} {minRetentionPrice.toFixed(2)}
                      </span>{" "}
                      (S/ 700)
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="item-discount">
                    Descuento (Sobre Precio Unitario)
                  </Label>
                  <Input
                    id="item-discount"
                    type="number"
                    min="0"
                    step="0.01"
                    max={newItem.precio_unitario}
                    value={newItem.descuento}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        descuento: parseFloat(e.target.value) || 0,
                      })
                    }
                    disabled={isAdvancePayment}
                  />
                  {newItem.descuento > 0 && newItem.precio_unitario > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Precio con descuento: {currencySymbol}{" "}
                      {(newItem.precio_unitario - newItem.descuento).toFixed(2)}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={closeSheet}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSaveItem}
              className="flex-1"
              disabled={
                allowEditLastItemDescription &&
                editingIndex !== null &&
                !isAdvancePayment
                  ? !newItem.descripcion
                  : !newItem.descripcion ||
                    newItem.precio_unitario <= 0 ||
                    !newItem.account_plan_id ||
                    (isFreeAdvanceAccount &&
                      (!newItem.anticipo_documento_serie ||
                        !newItem.anticipo_documento_numero))
              }
            >
              {editingIndex !== null ? "Actualizar" : "Agregar"}
            </Button>
          </div>
        </div>
      </GeneralSheet>
    </>
  );
}

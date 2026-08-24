import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { FormInput } from "@/shared/components/FormInput";
import { NumberFormat } from "@/shared/components/NumberFormat";
import { ApprovedAccesoriesResource } from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.interface";
import { ApprovedAccessoryRow } from "./ApprovedAccessoriesTable";

interface AccesorySheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (row: Omit<ApprovedAccessoryRow, "id">) => void;
  editingRow?: ApprovedAccessoryRow | null;
  accessories: ApprovedAccesoriesResource[];
  rows: ApprovedAccessoryRow[];
  canCreateApprovedAccessory?: boolean;
  onOpenCreateModal?: () => void;
  initialAccessoryId?: number;
  /** Cotización aprobada: solo se permite agregar/editar obsequios (no afectan el precio). */
  lockPaidAccessories?: boolean;
}

const EMPTY_FORM = {
  accessory_id: 0,
  quantity: 1,
  type: "ACCESORIO_ADICIONAL" as "ACCESORIO_ADICIONAL" | "OBSEQUIO",
  additional_price: 0,
};

export function AccesorySheet({
  open,
  onClose,
  onSubmit,
  editingRow = null,
  accessories,
  rows,
  canCreateApprovedAccessory = false,
  onOpenCreateModal,
  initialAccessoryId,
  lockPaidAccessories = false,
}: AccesorySheetProps) {
  const isEditing = !!editingRow;
  // Con la cotización aprobada, un nuevo registro solo puede ser obsequio
  // (no afecta el precio final); el tipo queda fijo y no seleccionable.
  const forceGiftType = lockPaidAccessories && !isEditing;

  const [form, setForm] = useState(
    forceGiftType ? { ...EMPTY_FORM, type: "OBSEQUIO" as const } : EMPTY_FORM,
  );
  const [errors, setErrors] = useState({
    accessory_id: false,
    accessory_duplicate: false,
    quantity: false,
  });

  useEffect(() => {
    if (editingRow) {
      setForm({
        accessory_id: editingRow.accessory_id,
        quantity: editingRow.quantity,
        type: editingRow.type,
        additional_price: editingRow.additional_price ?? 0,
      });
      setErrors({ accessory_id: false, accessory_duplicate: false, quantity: false });
    }
  }, [editingRow]);

  // Al abrir para agregar (no editar), partir de un formulario limpio,
  // forzando el tipo a OBSEQUIO cuando la cotización ya está aprobada.
  useEffect(() => {
    if (open && !editingRow) {
      setForm(forceGiftType ? { ...EMPTY_FORM, type: "OBSEQUIO" } : EMPTY_FORM);
    }
  }, [open, editingRow, forceGiftType]);

  useEffect(() => {
    if (open && !editingRow && initialAccessoryId) {
      setForm((prev) => ({ ...prev, accessory_id: initialAccessoryId }));
    }
  }, [open, editingRow, initialAccessoryId]);

  const handleClose = () => {
    setForm(forceGiftType ? { ...EMPTY_FORM, type: "OBSEQUIO" } : EMPTY_FORM);
    setErrors({ accessory_id: false, accessory_duplicate: false, quantity: false });
    onClose();
  };

  const handleSubmit = () => {
    const newErrors = {
      accessory_id: !form.accessory_id || form.accessory_id === 0,
      accessory_duplicate: false,
      quantity: form.quantity <= 0,
    };
    setErrors(newErrors);
    if (newErrors.accessory_id || newErrors.quantity) return;

    const duplicate = rows.find(
      (row) =>
        row.accessory_id === form.accessory_id && row.id !== editingRow?.id,
    );
    if (duplicate) {
      setErrors((prev) => ({ ...prev, accessory_duplicate: true }));
      return;
    }

    onSubmit(form);
    handleClose();
  };

  const selectedAccessory = accessories.find(
    (acc) => acc.id === form.accessory_id,
  );

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title={isEditing ? "Editar Accesorio / Obsequio" : "Agregar Accesorio / Obsequio"}
      subtitle={
        isEditing
          ? "Modifica los datos del accesorio o obsequio seleccionado"
          : "Agrega un nuevo accesorio o obsequio a la cotización"
      }
      icon={isEditing ? "Edit2" : "PackagePlus"}
      size="lg"
    >
      <div className="space-y-4">
        <SearchableSelect
          label="Tipo"
          value={form.type}
          onChange={(value) => {
            setForm({
              ...form,
              type: value as "ACCESORIO_ADICIONAL" | "OBSEQUIO",
            });
          }}
          disabled={lockPaidAccessories}
          options={[
            { label: "Accesorio Adicional", value: "ACCESORIO_ADICIONAL" },
            { label: "Obsequio", value: "OBSEQUIO" },
          ]}
          placeholder="Selecciona tipo"
          showSearch={false}
          allowClear={false}
          buttonSize="default"
        />

        <div>
          <div className="flex items-end gap-2">
            <SearchableSelect
              buttonSize="default"
              label="Accesorio"
              value={
                form.accessory_id === 0 ? "" : form.accessory_id.toString()
              }
              onChange={(value) => {
                setForm({ ...form, accessory_id: parseInt(value) });
                setErrors({
                  ...errors,
                  accessory_id: false,
                  accessory_duplicate: false,
                });
              }}
              options={accessories.map((accessory) => ({
                label: `${accessory.code} - ${accessory.description}`,
                value: accessory.id.toString(),
                description: accessory.type_operation,
              }))}
              placeholder="Selecciona un accesorio"
              className={
                errors.accessory_id || errors.accessory_duplicate
                  ? "border-red-500"
                  : ""
              }
              classNameDiv="flex-1"
              withValue={false}
            />
            {!isEditing && canCreateApprovedAccessory && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                title="Crear nuevo accesorio homologado (Solo Comercial)"
                onClick={onOpenCreateModal}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
          {errors.accessory_id && (
            <p className="text-xs text-red-500 mt-1">
              Seleccione un accesorio válido
            </p>
          )}
          {errors.accessory_duplicate && (
            <p className="text-xs text-red-500 mt-1">
              Este accesorio ya está asignado
            </p>
          )}
        </div>

        <FormInput
          name="quantity"
          label="Cantidad"
          type="number"
          min="1"
          value={form.quantity || ""}
          onChange={(e) => {
            setForm({ ...form, quantity: Number(e.target.value) || 0 });
            setErrors({ ...errors, quantity: false });
          }}
          placeholder="0"
          error={errors.quantity ? "Ingrese una cantidad mayor a 0" : undefined}
        />

        <FormInput
          name="additional_price"
          label={
            <>
              Precio Adicional{" "}
              <span className="text-gray-400 font-normal">(opcional)</span>
            </>
          }
          type="number"
          min="0"
          step="0.01"
          value={form.additional_price ?? ""}
          onChange={(e) => {
            const val = Number(e.target.value);
            setForm({
              ...form,
              additional_price: isNaN(val) || val < 0 ? 0 : val,
            });
          }}
          placeholder="0.00"
        />

        {selectedAccessory && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-primary dark:text-primary-foreground">
                Información del Accesorio
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground uppercase text-xs">
                    Código
                  </span>
                  <p className="font-medium">{selectedAccessory.code}</p>
                </div>
                <div>
                  <span className="text-muted-foreground uppercase text-xs">
                    Precio Unitario
                  </span>
                  <p className="font-medium">
                    {selectedAccessory.currency_symbol}{" "}
                    <NumberFormat
                      value={Number(selectedAccessory.price).toFixed(2)}
                    />
                  </p>
                </div>
                {(form.additional_price ?? 0) > 0 && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground uppercase text-xs">
                      Precio Efectivo Unit.:
                    </span>
                    <p className="font-medium text-primary">
                      {selectedAccessory.currency_symbol}{" "}
                      <NumberFormat
                        value={(
                          Number(selectedAccessory.price) +
                          (form.additional_price ?? 0)
                        ).toFixed(2)}
                      />
                    </p>
                  </div>
                )}
                <div className="col-span-2">
                  <span className="text-muted-foreground uppercase text-xs">
                    Descripción
                  </span>
                  <p className="font-medium">{selectedAccessory.description}</p>
                </div>
                {form.type === "OBSEQUIO" && (
                  <div className="col-span-2 mt-2 p-2 bg-green-100 border border-green-300 rounded">
                    <p className="text-xs text-green-800 font-medium">
                      Este artículo será marcado como obsequio y no se sumará al
                      total
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} className="flex-1">
            {isEditing ? "Guardar Cambios" : "Agregar"}
          </Button>
        </div>
      </div>
    </GeneralSheet>
  );
}

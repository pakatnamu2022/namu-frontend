import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { FormInput } from "@/shared/components/FormInput";
import { NumberFormat } from "@/shared/components/NumberFormat";
import { ApprovedAccesoriesResource } from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.interface";
import { CM_COMERCIAL_ID } from "@/features/ap/ap-master/lib/apMaster.constants";
import { ApprovedAccessoryRow } from "./ApprovedAccessoriesTable";

interface EditAccessorySheetProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<ApprovedAccessoryRow, "id">) => void;
  editingRow: ApprovedAccessoryRow | null;
  accessories: ApprovedAccesoriesResource[];
  rows: ApprovedAccessoryRow[];
}

const EMPTY_FORM = {
  accessory_id: 0,
  quantity: 1,
  type: "ACCESORIO_ADICIONAL" as "ACCESORIO_ADICIONAL" | "OBSEQUIO",
  additional_price: 0,
};

export function EditAccessorySheet({
  open,
  onClose,
  onSave,
  editingRow,
  accessories,
  rows,
}: EditAccessorySheetProps) {
  const [form, setForm] = useState(EMPTY_FORM);
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
      setErrors({
        accessory_id: false,
        accessory_duplicate: false,
        quantity: false,
      });
    }
  }, [editingRow]);

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({
      accessory_id: false,
      accessory_duplicate: false,
      quantity: false,
    });
    onClose();
  };

  const handleSave = () => {
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

    onSave(form);
    handleClose();
  };

  const availableAccessories =
    form.type === "OBSEQUIO"
      ? accessories.filter((acc) => acc.type_operation_id === CM_COMERCIAL_ID)
      : accessories;

  const selectedAccessory = accessories.find(
    (acc) => acc.id === form.accessory_id,
  );

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title="Editar Accesorio / Obsequio"
      subtitle="Modifica los datos del accesorio o obsequio seleccionado"
      icon="Edit2"
      size="lg"
    >
      <div className="space-y-4 px-4">
        <SearchableSelect
          label="Tipo"
          value={form.type}
          onChange={(value) => {
            const newType = value as "ACCESORIO_ADICIONAL" | "OBSEQUIO";
            const selectedAcc = accessories.find(
              (acc) => acc.id === form.accessory_id,
            );
            const resetId =
              newType === "OBSEQUIO" &&
              selectedAcc &&
              selectedAcc.type_operation_id !== CM_COMERCIAL_ID;
            setForm({
              ...form,
              type: newType,
              accessory_id: resetId ? 0 : form.accessory_id,
            });
          }}
          options={[
            { label: "Accesorio Adicional", value: "ACCESORIO_ADICIONAL" },
            { label: "Obsequio", value: "OBSEQUIO" },
          ]}
          placeholder="Selecciona tipo"
          showSearch={false}
          allowClear={false}
        />

        <div>
          <SearchableSelect
            label="Accesorio"
            value={form.accessory_id === 0 ? "" : form.accessory_id.toString()}
            onChange={(value) => {
              setForm({ ...form, accessory_id: parseInt(value) });
              setErrors({
                ...errors,
                accessory_id: false,
                accessory_duplicate: false,
              });
            }}
            options={availableAccessories.map((accessory) => ({
              label: `${accessory.code} - ${accessory.description}`,
              value: accessory.id.toString(),
            }))}
            placeholder="Selecciona un accesorio"
            className={
              errors.accessory_id || errors.accessory_duplicate
                ? "border-red-500"
                : ""
            }
          />
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
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-primary">
                Información del Accesorio
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Código:</span>
                  <p className="font-medium">{selectedAccessory.code}</p>
                </div>
                <div>
                  <span className="text-gray-600">Precio Unit.:</span>
                  <p className="font-medium">
                    {selectedAccessory.currency_symbol}{" "}
                    <NumberFormat
                      value={Number(selectedAccessory.price).toFixed(2)}
                    />
                  </p>
                </div>
                {(form.additional_price ?? 0) > 0 && (
                  <div className="col-span-2">
                    <span className="text-gray-600">
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
                  <span className="text-gray-600">Descripción:</span>
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
          <Button type="button" onClick={handleSave} className="flex-1">
            Guardar Cambios
          </Button>
        </div>
      </div>
    </GeneralSheet>
  );
}

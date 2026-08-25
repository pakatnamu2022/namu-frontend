import { Control } from "react-hook-form";
import { Building2, Plus } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { FormInput } from "@/shared/components/FormInput";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WarrantyInput } from "./WarrantyInput";
import { PurchaseOrderAccessoriesCard } from "./PurchaseOrderAccessoriesCard";
import {
  useModelVnById,
  useModelsVn,
} from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.hook";
import { ModelsVnResource } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.interface";
import {
  useVehicleColor,
  useVehicleColorById,
} from "@/features/ap/configuraciones/vehiculos/colores-vehiculo/lib/vehicleColor.hook";
import { VehicleColorResource } from "@/features/ap/configuraciones/vehiculos/colores-vehiculo/lib/vehicleColor.interface";
import { VehicleResourceWithCosts } from "../../vehiculos/lib/vehicles.interface";
import { VehicleResource } from "../../vehiculos/lib/vehicles.interface";
import { CM_COMERCIAL_ID } from "@/features/ap/ap-master/lib/apMaster.constants";

interface VehicleInfoSectionProps {
  control: Control<any>;
  canAssign?: boolean;
  canManage?: boolean;
  withVinWatch: boolean | undefined;
  vehiclesVn: VehicleResourceWithCosts[];
  isLoadingVehiclesVn: boolean;
  handleVinSearch: (value: string) => void;
  vinFamilyMismatch: VehicleResource | null | undefined;
  vehicleVnWatch: string | undefined;
  vehiclePurchaseOrderData: any;
  selectedFamilyId: number | undefined;
  setIsColorModalOpen: (open: boolean) => void;
  salePriceWatch: string | undefined;
  originalPrice: number;
  currencySymbol: string;
  modelVnWatch: string | undefined;
  selectedModel: ModelsVnResource | undefined;
  billedCost: number;
  /**
   * Cotización ya aprobada: bloquea el precio de venta (que ya quedó fijado).
   * El vehículo/modelo/color siguen editables mientras no esté pagada.
   */
  priceLocked?: boolean;
}

export const VehicleInfoSection = ({
  control,
  canAssign,
  canManage,
  withVinWatch,
  vehiclesVn,
  isLoadingVehiclesVn,
  handleVinSearch,
  vinFamilyMismatch,
  vehicleVnWatch,
  vehiclePurchaseOrderData,
  selectedFamilyId,
  setIsColorModalOpen,
  salePriceWatch,
  originalPrice,
  currencySymbol,
  modelVnWatch,
  selectedModel,
  billedCost,
  priceLocked = false,
}: VehicleInfoSectionProps) => {
  return (
    <GroupFormSection
      title="Información del Vehículo"
      icon={Building2}
      color="blue"
      cols={{ sm: 1, md: 2 }}
    >
      {/* Switch para seleccionar Con VIN o Sin VIN */}
      {canAssign && (
        <FormSwitch
          control={control}
          name="with_vin"
          label="Modo de Selección de Vehículo"
          text={withVinWatch ? "Con VIN" : "Sin VIN"}
        />
      )}
      {/* Mostrar campo de Vehículo VN cuando with_vin es true */}
      {withVinWatch && (
        <div className="col-span-full md:col-span-1">
          <FormSelect
            name="ap_vehicle_id"
            label="Vehículo VN"
            placeholder="Selecciona un vehículo"
            options={vehiclesVn.map((item) => ({
              label: item.vin + " | " + item.family,
              value: item.id.toString(),
              description:
                item.model_code + " | " + item.model + " | " + item.warehouse,
            }))}
            control={control}
            strictFilter={true}
            disabled={isLoadingVehiclesVn}
            withValue={false}
            isSearchable
            setSearchQuery={handleVinSearch}
          />
          {vinFamilyMismatch && (
            <Alert variant="warning" className="mt-2">
              <AlertDescription>
                El VIN <strong>{vinFamilyMismatch.vin}</strong> está activo,
                pero pertenece a la familia{" "}
                <strong>{vinFamilyMismatch.model?.family}</strong>, no a la
                familia de esta solicitud. Verifica el vehículo o edita la
                familia en la tarjeta de la oportunidad.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Mostrar accesorios de la orden de compra cuando se selecciona un VIN */}
      {withVinWatch &&
        vehicleVnWatch &&
        vehiclePurchaseOrderData?.purchase_order?.items && (
          <div className="col-span-full">
            <PurchaseOrderAccessoriesCard
              items={vehiclePurchaseOrderData.purchase_order.items}
              purchaseOrderNumber={vehiclePurchaseOrderData.purchase_order.number}
              currencySymbol={vehiclePurchaseOrderData.purchase_order.currency_code}
            />
          </div>
        )}

      {/* Mostrar campos de Modelo VN y Color cuando with_vin es false */}
      {!withVinWatch && (
        <>
          <FormSelectAsync
            name="ap_models_vn_id"
            label="Modelo VN"
            placeholder="Selecciona un modelo"
            control={control}
            useQueryHook={useModelsVn}
            mapOptionFn={(item: ModelsVnResource) => ({
              value: item.id.toString(),
              label: item.code + " - " + item.version,
            })}
            additionalParams={{
              family_id: selectedFamilyId,
              type_operation_id: CM_COMERCIAL_ID,
            }}
            useFindByIdHook={useModelVnById}
          />

          <FormSelectAsync
            name="vehicle_color_id"
            label="Color"
            placeholder="Selecciona un color"
            useQueryHook={useVehicleColor}
            mapOptionFn={(item: VehicleColorResource) => ({
              value: item.id.toString(),
              label: item.description,
              description: item.code ?? "S/C",
            })}
            useFindByIdHook={useVehicleColorById}
            control={control}
          >
            <Button
              type="button"
              variant="outline"
              size={"icon"}
              className="aspect-square"
              onClick={() => setIsColorModalOpen(true)}
              title="Agregar nuevo color"
            >
              <Plus className="size-2 md:size-4" />
            </Button>
          </FormSelectAsync>
        </>
      )}

      <FormInput
        control={control}
        name="sale_price"
        label={
          <div className="flex items-center gap-2 relative">
            Precio Venta
            <div className="absolute left-36 text-primary whitespace-nowrap bg-blue-50 px-2 rounded">
              {originalPrice > 0 && !withVinWatch && (
                <span className="text-xs text-primary bg-blue-50 px-1 rounded">
                  Original: {currencySymbol}{" "}
                  {originalPrice.toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              )}
              {originalPrice === 0 && !withVinWatch && modelVnWatch && (
                <span className="text-xs text-orange-600 bg-orange-50 px-1 rounded">
                  ⚠️ Modelo sin precio configurado
                </span>
              )}
            </div>
          </div>
        }
        type="text"
        placeholder="Ingrese precio de venta"
        disabled={priceLocked}
      >
        {/* Mostrar información adicional según el modo */}
        {withVinWatch && vehicleVnWatch && (
          <div className="mt-2 space-y-2 w-full">
            {canManage &&
              (billedCost > 0 ? (
                <>
                  <Alert variant="info">
                    <AlertDescription>
                      <span className="font-medium">Costo Compra:</span>{" "}
                      {currencySymbol}{" "}
                      {billedCost.toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </AlertDescription>
                  </Alert>
                </>
              ) : (
                <Alert variant="warning">
                  <AlertDescription>
                    Este vehículo no tiene costo de compra registrado. Revisar
                    el registro del vehículo.
                  </AlertDescription>
                </Alert>
              ))}
            {parseFloat(salePriceWatch || "0") === 0 && (
              <Alert variant="destructive">
                <AlertTitle>Precio de venta en 0</AlertTitle>
                <AlertDescription>
                  {!selectedModel ? (
                    "No se pudo cargar la información del modelo de este vehículo. Verifique que el vehículo pertenezca a la familia de la oportunidad seleccionada."
                  ) : originalPrice === 0 ? (
                    <>
                      El modelo <strong>"{selectedModel.code}"</strong> (ID:{" "}
                      {selectedModel.id}) de este vehículo no tiene precio de
                      venta configurado. Ir a Configuraciones → Modelos VN
                      para agregarlo.
                    </>
                  ) : (
                    <>
                      Se estableció manualmente, pero el modelo tiene
                      configurado {currencySymbol}{" "}
                      {originalPrice.toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                      })}
                      . Verifique si esto es correcto.
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Mostrar diagnóstico cuando NO hay VIN y el precio es 0 */}
        {!withVinWatch &&
          modelVnWatch &&
          parseFloat(salePriceWatch || "0") === 0 && (
            <div className="mt-2 w-full">
              <Alert variant="destructive">
                <AlertTitle>Precio de venta en 0</AlertTitle>
                <AlertDescription>
                  {!selectedModel ? (
                    "No se pudo cargar la información del modelo seleccionado."
                  ) : originalPrice === 0 ? (
                    <>
                      El modelo <strong>"{selectedModel.code}"</strong> (ID:{" "}
                      {selectedModel.id}) no tiene precio de venta
                      configurado. Ir a Configuraciones → Modelos VN para
                      agregarlo.
                    </>
                  ) : (
                    <>
                      Se estableció manualmente, pero el modelo tiene
                      configurado {currencySymbol}{" "}
                      {originalPrice.toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                      })}
                      . Verifique si esto es correcto.
                    </>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          )}
      </FormInput>

      <WarrantyInput control={control} required />
    </GroupFormSection>
  );
};

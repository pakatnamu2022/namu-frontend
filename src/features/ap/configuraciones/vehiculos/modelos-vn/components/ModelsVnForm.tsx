"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ModelsVnSchema,
  modelsVnSchemaCreate,
  modelsVnSchemaUpdate,
} from "../lib/modelsVn.schema";
import { ClipboardMinus } from "lucide-react";
import { Settings } from "lucide-react";
import { CircleDollarSign } from "lucide-react";
import { useAllBrands } from "../../marcas/lib/brands.hook";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllFamilies } from "../../familias/lib/families.hook";
import { useAllClassArticle } from "@/features/ap/configuraciones/maestros-general/clase-articulo/lib/classArticle.hook";
import { useAllFuelType } from "../../tipos-combustible/lib/fuelType.hook";
import { useAllVehicleType } from "../../tipos-vehiculo/lib/vehicleType.hook";
import { useAllBodyType } from "../../tipos-carroceria/lib/bodyType.hook";
import { useAllTractionType } from "../../tipos-traccion/lib/tractionType.hook";
import { useAllGearShiftType } from "../../transmision-vehiculo/lib/gearShiftType.hook";
import { useEffect, useRef } from "react";
import { calculateIGV } from "@/core/core.function";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { CM_COMERCIAL_ID } from "@/core/core.constants";

interface ModelsVnFormProps {
  defaultValues: Partial<ModelsVnSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel: () => void;
}

export const ModelsVnForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: ModelsVnFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? modelsVnSchemaCreate : (modelsVnSchemaUpdate as any),
    ),
    defaultValues: {
      ...defaultValues,
      type_operation_id:
        defaultValues.type_operation_id ?? String(CM_COMERCIAL_ID),
    },
    mode: "onChange",
  });
  const codigoOriginalRef = useRef(defaultValues.code);
  const marcaSeleccionada = form.watch("brand_id");
  const precioDistribuidor = form.watch("distributor_price");
  const familiaSeleccionada = form.watch("family_id");
  const yearModelo = form.watch("model_year");
  const typeOperationId = form.watch("type_operation_id");
  const { data: brands = [], isLoading: isLoadingbrands } = useAllBrands(
    typeOperationId === String(CM_COMERCIAL_ID)
      ? { type_operation_id: typeOperationId }
      : {},
  );
  const { data: families = [], isLoading: isLoadingFamilies } = useAllFamilies({
    brand_id: marcaSeleccionada,
  });
  const { data: articleClasses = [], isLoading: isLoadingArticleClasses } =
    useAllClassArticle({
      type: "VEHICULO",
      type_operation_id: CM_COMERCIAL_ID,
    });
  const { data: fuelTypes = [], isLoading: isLoadingFuelTypes } =
    useAllFuelType();
  const { data: typesVehicles = [], isLoading: isLoadingTypesVehicles } =
    useAllVehicleType();
  const { data: bodyTypes = [], isLoading: isLoadingBodyTypes } =
    useAllBodyType();
  const { data: tractionTypes = [], isLoading: isLoadingTractionTypes } =
    useAllTractionType();
  const {
    data: vehicleTransmissions = [],
    isLoading: isLoadingVehicleTransmissions,
  } = useAllGearShiftType();
  const { data: currencyTypes = [], isLoading: isLoadingCurrencyTypes } =
    useAllCurrencyTypes();

  useEffect(() => {
    if (!familiaSeleccionada || !yearModelo) return;

    if (mode === "update") {
      if (
        defaultValues.family_id === familiaSeleccionada &&
        defaultValues.model_year === yearModelo
      ) {
        if (form.getValues("code") !== codigoOriginalRef.current) {
          form.setValue("code", codigoOriginalRef.current, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
        return;
      }
    }

    const familiaObj = families.find(
      (family) => family.id.toString() === familiaSeleccionada,
    );
    if (!familiaObj) return;
    const year2Digitos = yearModelo.toString().slice(-2);
    const nuevoCodigo = `${familiaObj.code}${year2Digitos}X`;

    if (form.getValues("code") !== nuevoCodigo) {
      form.setValue("code", nuevoCodigo, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [
    familiaSeleccionada,
    yearModelo,
    families,
    mode,
    defaultValues.family_id,
    defaultValues.model_year,
    form,
  ]);

  useEffect(() => {
    if (mode === "create") {
      if (marcaSeleccionada) {
        const familiaActual = form.getValues("family_id");
        if (familiaActual) {
          form.setValue("family_id", "", {
            shouldValidate: false,
            shouldDirty: true,
          });
        }
      } else {
        form.setValue("family_id", "", {
          shouldValidate: false,
          shouldDirty: true,
        });
      }
    }
  }, [marcaSeleccionada, form, mode]);

  useEffect(() => {
    const distribuidor = Number(precioDistribuidor);
    const valueWithIgv =
      !isNaN(distribuidor) && distribuidor > 0
        ? calculateIGV(distribuidor, false)
        : { total: 0, base: 0, igv: 0 };

    const campos = {
      total_purchase_incl_igv: valueWithIgv.total,
      total_purchase_excl_igv: valueWithIgv.base,
      igv_amount: valueWithIgv.igv,
    };

    (Object.entries(campos) as [keyof typeof campos, number][]).forEach(
      ([campo, valor]) => {
        const current = Number(form.getValues(campo));
        if (current !== valor) {
          form.setValue(campo, valor, {
            shouldValidate: false,
            shouldDirty: true,
          });
        }
      },
    );
  }, [precioDistribuidor, form]);

  const isLoading =
    isLoadingArticleClasses ||
    isLoadingFuelTypes ||
    isLoadingTypesVehicles ||
    isLoadingBodyTypes ||
    isLoadingTractionTypes ||
    isLoadingVehicleTransmissions ||
    isLoadingCurrencyTypes;
  if (isLoading) return <FormSkeleton />;

  const getFamilyOptions = () => {
    if (!marcaSeleccionada) {
      return [
        {
          label: "Primero seleccione una marca",
          value: "",
          disabled: true,
        },
      ];
    }

    if (isLoadingFamilies) {
      return [
        {
          label: "Cargando familias...",
          value: "",
          disabled: true,
        },
      ];
    }

    if (families.length === 0) {
      return [
        {
          label: "No hay familias disponibles",
          value: "",
          disabled: true,
        },
      ];
    }

    return families.map((family) => ({
      label: family.description,
      value: family.id.toString(),
    }));
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full formlayout"
      >
        <div className="space-y-8">
          {/* Sección: Datos Generales */}
          <GroupFormSection
            title="Datos Generales"
            icon={ClipboardMinus}
            iconColor="text-secondary"
            bgColor="bg-red-50"
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Cod.
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="bg-accent"
                      placeholder="Ej: 0101004"
                      {...field}
                      readOnly
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormSelect
              name="brand_id"
              label="Marca"
              placeholder="Selecciona una Marca"
              options={brands.map((brand) => ({
                label: brand.description,
                value: brand.id.toString(),
              }))}
              control={form.control}
            />
            <FormSelect
              name="family_id"
              label="Familia"
              placeholder={
                !marcaSeleccionada
                  ? "Primero seleccione una marca"
                  : "Selecciona una Familia"
              }
              options={getFamilyOptions()}
              control={form.control}
              disabled={!marcaSeleccionada || isLoadingFamilies}
            />
            <FormField
              control={form.control}
              name="version"
              disabled={isLoadingbrands}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Versión
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: X7 PLUS LIMITED 1.5 MT 4X2"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormSelect
              name="class_id"
              label="Clase Artículo"
              placeholder="Selecciona una clase"
              options={articleClasses.map((classArticle) => ({
                label: classArticle.description,
                value: classArticle.id.toString(),
              }))}
              control={form.control}
            />
          </GroupFormSection>

          {/* Sección: Datos Técnicos */}
          <GroupFormSection
            title="Datos Técnicos"
            icon={Settings}
            iconColor="text-primary"
            bgColor="bg-blue-50"
          >
            <FormSelect
              name="fuel_id"
              label="Tipo Combustible"
              placeholder="Selecciona un Tipo"
              options={fuelTypes.map((fuelType) => ({
                label: fuelType.description,
                value: fuelType.id.toString(),
              }))}
              control={form.control}
            />
            {typeOperationId === String(CM_COMERCIAL_ID) && (
              <FormField
                control={form.control}
                name="power"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Potencia
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="model_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Año Modelo
                  </FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej: 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {typeOperationId === String(CM_COMERCIAL_ID) && (
              <>
                <FormField
                  control={form.control}
                  name="wheelbase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Distancia Ejes
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ej: 0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="axles_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Núm. Ejes
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ej: 0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <FormSelect
              name="vehicle_type_id"
              label="Tipo Vehículo"
              placeholder="Seleccionar Tipo"
              options={typesVehicles.map((typeVehicle) => ({
                label: typeVehicle.description,
                value: typeVehicle.id.toString(),
              }))}
              control={form.control}
            />
            <FormSelect
              name="body_type_id"
              label="Tipo Carrocería"
              placeholder="Seleccionar Tipo"
              options={bodyTypes.map((bodyType) => ({
                label: bodyType.description,
                value: bodyType.id.toString(),
              }))}
              control={form.control}
            />
            <FormSelect
              name="traction_type_id"
              label="Tipo Tracción"
              placeholder="Seleccionar Tipo"
              options={tractionTypes.map((tractionType) => ({
                label: tractionType.description,
                value: tractionType.id.toString(),
              }))}
              control={form.control}
            />
            <FormSelect
              name="transmission_id"
              label="Tipo Transmisión"
              placeholder="Seleccionar Tipo"
              options={vehicleTransmissions.map((vehicleTransmission) => ({
                label: vehicleTransmission.description,
                value: vehicleTransmission.id.toString(),
              }))}
              control={form.control}
            />
            {typeOperationId === String(CM_COMERCIAL_ID) && (
              <>
                <FormField
                  control={form.control}
                  name="width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Ancho
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Largo
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Altura
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seats_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Núm. Asientos
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ej: 0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <FormField
              control={form.control}
              name="doors_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Núm. Puertas
                  </FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej: 0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {typeOperationId === String(CM_COMERCIAL_ID) && (
              <>
                <FormField
                  control={form.control}
                  name="net_weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Peso Neto
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gross_weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Peso Bruto
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="payload"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Carga Útil
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="displacement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Cilindrada
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cylinders_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Núm. Cilindros
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ej: 0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <FormField
              control={form.control}
              name="passengers_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Núm. Pasajeros
                  </FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej: 0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="wheels_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Núm. Ruedas
                  </FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej: 0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </GroupFormSection>

          {/* Sección: Precio Distribuidor */}
          {typeOperationId === String(CM_COMERCIAL_ID) && (
            <GroupFormSection
              title="Precio Distribuidor"
              icon={CircleDollarSign}
              iconColor="text-gray-600"
              bgColor="bg-gray-50"
            >
              <FormSelect
                name="currency_type_id"
                label="Tipo Moneda"
                placeholder="Seleccionar Tipo"
                options={currencyTypes.map((currencyType) => ({
                  label: currencyType.name,
                  value: currencyType.id.toString(),
                }))}
                control={form.control}
              />
              <FormField
                control={form.control}
                name="distributor_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Precio Distribuidor
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ej: 0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="transport_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Costo Transporte
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ej: 0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="other_amounts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Otros Importes
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ej: 0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="purchase_discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      % Dsc. de Compra
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ej: 0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="igv_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Importe IGV
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-accent"
                        placeholder="Ej: 0.00"
                        {...field}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="total_purchase_excl_igv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Total Compra sin IGV
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-accent"
                        placeholder="Ej: 0.00"
                        {...field}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="total_purchase_incl_igv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Total Compra con IGV
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-accent"
                        placeholder="Ej: 0.00"
                        {...field}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sale_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Precio Venta
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ej: 0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="margin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      % Margen
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ej: 0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </GroupFormSection>
          )}
        </div>
        <div className="flex gap-4 w-full justify-end">
          <ConfirmationDialog
            trigger={
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            }
            title="¿Cancelar registro?"
            variant="destructive"
            icon="warning"
            onConfirm={onCancel}
          />

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Modelo VN"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

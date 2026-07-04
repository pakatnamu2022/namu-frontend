"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { VEHICLES_RP } from "../lib/vehicles.constants";
import { storeReplacement } from "../lib/vehicles.actions";
import { VehicleResource } from "../lib/vehicles.interface";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader, MapPin, Plus } from "lucide-react";
import { FormInput } from "@/shared/components/FormInput";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { DocumentValidationStatus } from "@/shared/components/DocumentValidationStatus";
import { ValidationIndicator } from "@/shared/components/ValidationIndicator";
import { usePlateValidation } from "@/shared/hooks/useDocumentValidation";
import { useEffect, useRef, useState } from "react";
import { CM_POSTVENTA_ID } from "@/features/ap/ap-master/lib/apMaster.constants";
import { useAllBrands } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.hook";
import {
  useAllModelsVn,
  useModelsVn,
} from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.hook";
import { ModelsVnResource } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.interface";
import ModelsVnModal from "@/features/ap/configuraciones/vehiculos/modelos-vn/components/ModelsVnModal";
import { MODELS_VN } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.constanst";
import { BRAND_ID } from "@/features/ap/configuraciones/vehiculos/grupos-marcas/lib/brandGroup.constants";

const vehicleRepuestosSchema = z.object({
  sede_id: z.string().min(1, "La sede es requerida"),
  plate: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length === 6,
      "La placa debe tener 6 caracteres",
    ),
  vin: z.string().min(1, "El VIN es requerido").max(20),
  engine_number: z.string().min(1, "El número de motor es requerido"),
  brand_id: z.string().min(1, "La marca es requerida"),
  ap_models_vn_id: z.string().min(1, "El modelo es requerido"),
});

type VehicleRepuestosSchema = z.infer<typeof vehicleRepuestosSchema>;

interface VehicleRepuestosModalProps {
  open: boolean;
  onClose: (newVehicle?: VehicleResource) => void;
  title?: string;
  sedeId?: string;
  sedeName?: string;
}

export default function VehicleRepuestosModal({
  open,
  onClose,
  title = "Agregar Vehículo",
  sedeId,
  sedeName,
}: VehicleRepuestosModalProps) {
  const queryClient = useQueryClient();
  const { MODEL, ICON } = VEHICLES_RP;
  const [isSuccessfulResponse, setIsSuccessfulResponse] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);

  const defaultBrandId = String(BRAND_ID.VARIOS);

  const form = useForm<VehicleRepuestosSchema>({
    resolver: zodResolver(vehicleRepuestosSchema),
    defaultValues: {
      sede_id: sedeId ?? "",
      plate: "",
      vin: "",
      engine_number: "",
      brand_id: defaultBrandId,
      ap_models_vn_id: "",
    },
    mode: "onChange",
  });

  const { data: brands = [], isLoading: isLoadingBrands } = useAllBrands();
  const brandWatch = form.watch("brand_id");

  const { data: defaultBrandModels = [] } = useAllModelsVn({
    family$brand_id: defaultBrandId,
  });

  // Al abrir el modal, preselecciona la marca "Varios" y su único/primer modelo disponible
  useEffect(() => {
    if (!open) return;
    if (form.getValues("brand_id")) return;
    form.setValue("brand_id", defaultBrandId, { shouldValidate: true });
  }, [open, defaultBrandId, form]);

  useEffect(() => {
    if (!open) return;
    if (brandWatch !== defaultBrandId) return;
    if (form.getValues("ap_models_vn_id")) return;
    if (defaultBrandModels.length === 0) return;
    form.setValue("ap_models_vn_id", defaultBrandModels[0].id.toString(), {
      shouldValidate: true,
    });
  }, [open, brandWatch, defaultBrandId, defaultBrandModels, form]);

  const plateWatch = form.watch("plate");

  useEffect(() => {
    if (plateWatch && plateWatch.length > 0) {
      setIsFirstLoad(false);
    }
  }, [plateWatch]);

  const {
    data: plateData,
    isLoading: isPlateLoading,
    error: plateError,
  } = usePlateValidation(
    plateWatch,
    !isFirstLoad && !!plateWatch && plateWatch.length === 6,
  );

  useEffect(() => {
    if (isFirstLoad) return;
    if (plateData?.success && plateData.data) {
      form.setValue("vin", plateData.data.vin ?? "", { shouldValidate: true });
      form.setValue("engine_number", plateData.data.engine_number ?? "", {
        shouldValidate: true,
      });
      setIsSuccessfulResponse(true);
    } else if (plateWatch && plateWatch.length === 6) {
      form.setValue("vin", "", { shouldValidate: true });
      form.setValue("engine_number", "", { shouldValidate: true });
      setIsSuccessfulResponse(false);
    }
  }, [plateData, form, isFirstLoad, plateWatch]);

  useEffect(() => {
    if (sedeId) {
      form.setValue("sede_id", sedeId, { shouldValidate: true });
    }
  }, [sedeId, form]);

  const previousBrandId = useRef(brandWatch);

  useEffect(() => {
    if (brandWatch === previousBrandId.current) return;
    previousBrandId.current = brandWatch;
    form.setValue("ap_models_vn_id", "", { shouldValidate: false });
  }, [brandWatch, form]);

  const { mutate: createVehicle, isPending: isCreating } = useMutation({
    mutationFn: storeReplacement,
    onSuccess: (newVehicle) => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      queryClient.invalidateQueries({ queryKey: [VEHICLES_RP.QUERY_KEY] });
      form.reset({
        sede_id: sedeId ?? "",
        plate: "",
        vin: "",
        engine_number: "",
        brand_id: defaultBrandId,
        ap_models_vn_id: "",
      });
      setIsSuccessfulResponse(false);
      onClose(newVehicle);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (
    data: VehicleRepuestosSchema,
    e?: React.BaseSyntheticEvent,
  ) => {
    e?.preventDefault();
    e?.stopPropagation();
    createVehicle({
      ...data,
      type_operation_id: String(CM_POSTVENTA_ID),
    } as any);
  };

  const handleClose = () => {
    form.reset({
      sede_id: sedeId ?? "",
      plate: "",
      vin: "",
      engine_number: "",
      brand_id: defaultBrandId,
      ap_models_vn_id: "",
    });
    setIsSuccessfulResponse(false);
    onClose();
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title={title}
      icon={ICON}
      subtitle="Completa los datos para registrar el vehículo"
      size="lg"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {sedeName && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span>
                Sede:{" "}
                <span className="font-semibold text-foreground">
                  {sedeName}
                </span>
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="plate"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-between">
                  <FormLabel className="flex justify-start items-center text-xs md:text-sm mb-1 leading-none h-fit dark:text-muted-foreground relative">
                    Nro. Placa
                    <DocumentValidationStatus
                      shouldValidate={true}
                      documentNumber={plateWatch || ""}
                      expectedDigits={6}
                      isValidating={isPlateLoading}
                      leftPosition="right-0"
                    />
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        className="h-8 md:h-9 text-xs md:text-sm uppercase"
                        placeholder="Ej: ABC123"
                        {...field}
                        maxLength={6}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                      <ValidationIndicator
                        show={!!plateWatch}
                        isValidating={isPlateLoading}
                        isValid={plateData?.success && !!plateData.data}
                        hasError={
                          !!plateError || (plateData && !plateData.success)
                        }
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormInput
              name="vin"
              label="VIN"
              placeholder="Ej: 1HGBH41AX1N109189"
              control={form.control}
              disabled={isSuccessfulResponse}
              required
            />

            <FormInput
              name="engine_number"
              label="Número de Motor"
              placeholder="Ej: ENG32345XYZA"
              control={form.control}
              disabled={
                isSuccessfulResponse && !!plateData?.data?.engine_number
              }
              required
            />

            <FormSelect
              name="brand_id"
              label="Marca"
              placeholder="Selecciona una marca"
              options={brands.map((brand) => ({
                label: brand.description,
                value: brand.id.toString(),
              }))}
              control={form.control}
              disabled={isLoadingBrands}
              required
            />

            <FormSelectAsync
              name="ap_models_vn_id"
              label="Modelo"
              placeholder={
                !brandWatch
                  ? "Primero selecciona una marca"
                  : "Seleccionar modelo"
              }
              control={form.control}
              useQueryHook={useModelsVn}
              mapOptionFn={(item: ModelsVnResource) => ({
                value: item.id.toString(),
                label: `${item.code} - ${item.version}`,
              })}
              perPage={10}
              debounceMs={500}
              additionalParams={{ family$brand_id: brandWatch }}
              disabled={!brandWatch}
              required
            >
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                className="aspect-square"
                onClick={() => setIsModelModalOpen(true)}
                tooltip="Agregar nuevo modelo"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </FormSelectAsync>
          </div>

          <div className="flex gap-4 w-full justify-end pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !form.formState.isValid}
            >
              <Loader
                className={`mr-2 h-4 w-4 animate-spin ${!isCreating ? "hidden" : ""}`}
              />
              {isCreating ? "Guardando..." : "Crear Vehículo"}
            </Button>
          </div>
        </form>
      </Form>

      <ModelsVnModal
        open={isModelModalOpen}
        onClose={() => {
          setIsModelModalOpen(false);
          queryClient.invalidateQueries({
            queryKey: [MODELS_VN.QUERY_KEY],
          });
        }}
        title="Agregar Nuevo Modelo VN"
        mode="create"
      />
    </GeneralModal>
  );
}

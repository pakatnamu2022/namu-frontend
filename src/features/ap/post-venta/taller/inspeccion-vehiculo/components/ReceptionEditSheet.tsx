import { useMutation, useQueryClient } from "@tanstack/react-query";
import GeneralSheet from "@/shared/components/GeneralSheet";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { ReceptionEditForm } from "./ReceptionEditForm";
import {
  ReceptionEditSchema,
  receptionEditSchema,
} from "../lib/vehicleInspection.schema";
import { updateVehicleInspection } from "../lib/vehicleInspection.actions";
import {
  VEHICLE_INSPECTION,
  CHECKLIST_ITEMS,
} from "../lib/vehicleInspection.constants";
import { VehicleInspectionResource } from "../lib/vehicleInspection.interface";

interface ReceptionEditSheetProps {
  open: boolean;
  onClose: () => void;
  inspection: VehicleInspectionResource;
  workOrderId: number;
  dateOrderWork?: Date;
}

const editableFields = [
  "mileage",
  "fuel_level",
  "oil_level",
  "washed",
  "oil_change",
  "check_level_lights",
  "general_lubrication",
  "rotation_inspection_cleaning",
  "insp_filter_basic_checks",
  "tire_pressure_inflation_check",
  "alignment_balancing",
  "pad_replace_disc_resurface",
  "tire_rotation",
  "other_work_details",
  "customer_requirement",
  ...CHECKLIST_ITEMS.map((item) => item.key),
  "explanation_work_performed",
  "price_explanation",
  "confirm_additional_work",
  "clarification_customer_concerns",
  "exterior_cleaning",
  "interior_cleaning",
  "keeps_spare_parts",
  "valuable_objects",
  "courtesy_seat_cover",
  "paper_floor",
] as const;

export const ReceptionEditSheet = ({
  open,
  onClose,
  inspection,
  workOrderId,
}: ReceptionEditSheetProps) => {
  const queryClient = useQueryClient();
  const { QUERY_KEY, MODEL } = VEHICLE_INSPECTION;

  const { mutate: update, isPending } = useMutation({
    mutationFn: (data: ReceptionEditSchema) =>
      updateVehicleInspection(inspection.id, data as any),
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["workOrder", workOrderId] });
      onClose();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    },
  });

  const handleSubmit = (data: ReceptionEditSchema) => {
    const payload = {
      ...data,
    };
    update(payload);
  };

  const defaultValues: Partial<ReceptionEditSchema> = editableFields.reduce(
    (acc, key) => {
      const value = inspection[key as keyof VehicleInspectionResource];
      (acc as Record<string, unknown>)[key] =
        value === null || value === undefined ? undefined : value;
      return acc;
    },
    {} as Partial<ReceptionEditSchema>,
  );

  defaultValues.mileage = inspection.mileage
    ? Number(inspection.mileage)
    : undefined;

  const parsed = receptionEditSchema.partial().safeParse(defaultValues);

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title="Editar Recepción de Vehículo"
      subtitle="Actualiza la información registrada durante la recepción"
      icon="ClipboardCheck"
      size="4xl"
    >
      <ReceptionEditForm
        defaultValues={parsed.success ? parsed.data : defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        onCancel={onClose}
      />
    </GeneralSheet>
  );
};

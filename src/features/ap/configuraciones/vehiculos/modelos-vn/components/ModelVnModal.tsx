import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { ModelsVnSchema } from "../lib/modelsVn.schema";
import { storeModelsVn } from "../lib/modelsVn.actions";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { ModelsVnForm } from "./ModelsVnForm";
import { MODELS_VN } from "../lib/modelsVn.constanst";
import { ModelsVnResource } from "../lib/modelsVn.interface";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: (newModel: ModelsVnResource) => void;
}

const { QUERY_KEY, MODEL } = MODELS_VN;

const EMPTY_DEFAULTS: Partial<ModelsVnSchema> = {
  code: "",
  version: "",
  power: "0",
  model_year: "0",
  wheelbase: "0",
  axles_number: "0",
  width: "0",
  length: "0",
  height: "0",
  net_weight: "0",
  gross_weight: "0",
  payload: "0",
  displacement: "0",
  distributor_price: 0,
  transport_cost: 0,
  other_amounts: 0,
  purchase_discount: 0,
  igv_amount: 0,
  total_purchase_excl_igv: 0,
  total_purchase_incl_igv: 0,
  sale_price: 0,
  margin: 0,
};

export default function ModelVnModal({ open, onClose, onSuccess }: Props) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ModelsVnSchema) => storeModelsVn(data),
    onSuccess: async (newModel) => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      onSuccess?.(newModel);
      onClose();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Nuevo Modelo VN"
      icon="Car"
      size="7xl"
    >
      <ModelsVnForm
        defaultValues={EMPTY_DEFAULTS}
        onSubmit={(data) => mutate(data)}
        isSubmitting={isPending}
        mode="create"
        onCancel={onClose}
      />
    </GeneralModal>
  );
}

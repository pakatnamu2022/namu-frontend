import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FREIGHTCONTROL } from "../lib/freightControl.constants";
import { useFormData, useFreightById } from "../lib/freightControl.hook";
import { FreightControlResource } from "../lib/freightControl.interface";
import { FreightSchema } from "../lib/freightControl.schema";
import { storeFreight, updateFreight } from "../lib/freightControl.actions";
import { ERROR_MESSAGE, errorToast, SUCCESS_MESSAGE, successToast } from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { FreightForm } from "./FreightForm";
import FormSkeleton from "@/shared/components/FormSkeleton";



interface Props {
    id?: number;
    open: boolean;
    onClose: () => void;
    title: string;
    mode: "create" | "update";
}

export default function FreightModal({id, open, onClose, title, mode}: Props)
{
    const {EMPTY, MODEL, QUERY_KEY} = FREIGHTCONTROL;
    const queryClient = useQueryClient();

    const { data: formData, isLoading: loadingFormData } = useFormData();

    const {
        data: freight,
        isLoading: loadingFreight,
        refetch,
    } = mode === "create"
      ? { data: EMPTY, isLoading: false, refetch: () => {}}
      : useFreightById(id!);

      function mapFreightToFrom(data: FreightControlResource & {
        startPoint_id?: number;
        endPoint_id?: number;
      }): Partial<FreightSchema>{
        return {
            customer: data.customer_id,
            startPoint: data.startPoint_id,
            endPoint: data.endPoint_id,
            freight: data.freight,
            tipo_flete: data.tipo_flete ,
        };
      }


      const { mutate, isPending } = useMutation({
        mutationFn: (data: FreightSchema) =>
            mode === "create" ? storeFreight(data) : updateFreight(id!, data),
        onSuccess: async () => {
            successToast(SUCCESS_MESSAGE(MODEL, mode));
            await queryClient.invalidateQueries({queryKey: [QUERY_KEY]});
            
            await queryClient.invalidateQueries({ 
                queryKey: ["freight"]
            });
            if(mode === "update"){
              await refetch();
            }
            onClose();
        },
        onError: (error: any) => {
            errorToast(error.response?.data?.message ?? ERROR_MESSAGE(MODEL, mode));
        },
      });

      const handleSubmit = (data: FreightSchema) => {
        mutate(data);
      };

      const isLoadingAny = loadingFreight || loadingFormData || !formData;

      return(
        <GeneralModal open={open} onClose={onClose} title={title}>
            {isLoadingAny ? (
                <FormSkeleton/>
            ): (
                <FreightForm
                    onCancel={onClose}
                    onSubmit={handleSubmit}
                    isSubmitting={isPending}
                    mode={mode}
                    customers={formData?.customers || []}
                    citys={formData?.cities || []}
                    defaultValues={freight ? mapFreightToFrom(freight) : {}}
                />
                
            )}

        </GeneralModal>
      )
}
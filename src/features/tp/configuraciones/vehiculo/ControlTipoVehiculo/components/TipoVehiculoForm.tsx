import { useForm } from "react-hook-form";
import {
    tipoVehiculoSchemaCreate,
    tipoVehiculoSchemaUpdate,
    TipoVehiculoSchema,
} from "../libs/tipoVehiculo.schema";
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
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

interface TipoVehiculoFormProps {
    defaultValues?: Partial<TipoVehiculoSchema>;
    onSubmit: (data: any) => void;
    isSubmitting?: boolean;
    mode?: "create" | "update";
    onCancel?: () => void;
}

export const TipoVehiculoForm = ({
    defaultValues,
    onSubmit,
    isSubmitting = false,
    mode = "create",
    onCancel,
}: TipoVehiculoFormProps) => {
    const form = useForm({
        resolver: zodResolver(
            mode === "create" ? tipoVehiculoSchemaCreate : tipoVehiculoSchemaUpdate
        ),
        defaultValues: {
            descripcion: "",
            ...defaultValues,
        },
        mode: "onChange",
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
                <div className="grid grid-cols-1 gap-4">
                    {/* Descripción */}
                    <FormField
                        control={form.control}
                        name="descripcion"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Descripción <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Ingrese la descripción del tipo de vehículo"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex gap-4 w-full justify-end pt-6">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Descartar
                    </Button>

                    <Button
                        type="submit"
                        disabled={isSubmitting || !form.formState.isValid}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            "Enviar"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
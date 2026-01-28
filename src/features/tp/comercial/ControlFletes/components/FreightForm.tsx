import { useForm } from "react-hook-form";
import { FreightSchema, freightSchemaCreate, freightSchemaUpdate } from "../lib/freightControl.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { FormSelect } from "@/shared/components/FormSelect";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCustomerSearch } from "../lib/freightControl.hook";
import { CustomerSearchParams } from "../lib/freightControl.actions";
interface CustomerResource{
    id: string;
    nombre_completo: string;
}

interface CitysResource{
    id: string;
    descripcion: string;
}

interface FreightFormProps {
    defaultValues?: Partial<FreightSchema>;
    onSubmit: (data: any) => void;
    isSubmitting?: boolean;
    mode?: "create" | "update";
    onCancel?: () => void;
    customers?: CustomerResource[];
    citys?: CitysResource[];
}

export const FreightForm = ({
    defaultValues,
    onSubmit,
    isSubmitting = false,
    mode = "create",
    onCancel,
    customers = [],
    citys = [],
}: FreightFormProps) => {
    const form = useForm({
        resolver: zodResolver(
            mode === "create" ? freightSchemaCreate : freightSchemaUpdate
        ),
        defaultValues: {
            ...defaultValues,
        },
        mode: "onChange",
    });
    
    const [customerOptions, setCustomerOptions] = useState(
        customers.map(customer => ({
            label: customer.nombre_completo,
            value: customer.id,
        }))
    )
    const [searchParams, setSearchParams] = useState<CustomerSearchParams | undefined>(undefined);
    const { data: searchResults, isLoading: isSearching } = useCustomerSearch(searchParams);
    const searchTimeoutRef = useRef<number | null>(null);
    
    const handleSearch = (searchTerm: string) => {
        if(searchTimeoutRef.current){
            clearTimeout(searchTimeoutRef.current);
        }
        if (!searchTerm.trim()) {
            setCustomerOptions(
                customers.map(customer => ({
                    label: customer.nombre_completo,
                    value: customer.id
                }))
            );
            setSearchParams(undefined);
            return;
        }
         searchTimeoutRef.current = setTimeout(() => {
            setSearchParams({ search: searchTerm, limit: 30 });
        }, 300);
    };
    useEffect(() => {
        if (searchResults?.data) {
            const newOptions = searchResults.data.map(customer => ({
                label: customer.nombre_completo,
                value: customer.id
            }));
            setCustomerOptions(newOptions);
        }
    }, [searchResults]);

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    return(
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
                <div className="grid grid-cols-1 gap-4">
                    <FormSelect
                        control={form.control}
                        name="customer"
                        label="Cliente"
                        placeholder="Seleccione un cliente"
                        options={customerOptions}
                        isSearchable={true}
                        setSearchQuery={handleSearch}
                        isLoadingOptions={isSearching}
                        
                    />
                    
                    <FormSelect 
                        control={form.control}
                        name="startPoint"
                        label="Origen"
                        placeholder="Seleccione Origen"
                        options={citys.map((city) => ({
                            label: city.descripcion,
                            value: city.id,
                        }))}
                    />

                    <FormSelect 
                        control={form.control}
                        name="endPoint"
                        label="Destino"
                        placeholder="Seleccione Destino"
                        options={citys.map((city) => ({
                            label: city.descripcion,
                            value: city.id,
                        }))}
                    />

                    <FormSelect
                        control={form.control}
                        name="tipo_flete"
                        label="Tipo Flete"
                        placeholder="Seleccione tipo de flete"
                        options={[
                            { label: "TONELADAS", value: "TONELADAS" },
                            { label: "VIAJE", value: "VIAJE" },
                            { label: "CAJA", value: "CAJA" },
                            { label: "PALET", value: "PALET" },
                            { label: "BOLSA", value: "BOLSA" },
                        ]}
                    />

                    <FormField
                        control={form.control}
                        name="freight"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                            Flete <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                            <Input 
                                type="number" 
                                placeholder="Ingrese flete" 
                                {...field}
                                value={field.value === undefined ? '' : field.value}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const numValue = value === '' ? undefined : parseFloat(value);
                                    field.onChange(isNaN(numValue!) ? value : numValue);

                                }} 
                            
                            
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
                    disabled={isSubmitting || !form.formState.isValid}>

                        {isSubmitting ? (
                            <>
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                            </>
                        ): (
                            "Enviar"
                        )}
                    </Button>
                </div>
            </form>

        </Form>
    )
    
}
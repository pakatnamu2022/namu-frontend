import { useForm } from "react-hook-form";
import {
    vehiculoSchemaCreate,
    vehiculoSchemaUpdate,
    VehiculoSchema,
    VehiculoSchemaUpdate,
} from "../libs/vehiculo.schema";
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
import {
    Loader,
    ChevronDown,
    ChevronUp,
    Settings2,
    Building2,
    Truck,
    Gauge,
    Weight,
    Ruler,
    Fuel,
    Calendar,
    Car,
    CircleCheck,
    CircleX,
    Users,
    Hash,
    Tags,
    FileText,
    MapPin,
} from "lucide-react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface FormData {
    vehicleTypes: Array<{ id: string; descripcion: string }>;
    sedes: Array<{ id: string; abreviatura: string }>;
}

interface VehiculoFormProps {
    defaultValues?: Partial<VehiculoSchema | VehiculoSchemaUpdate>;
    onSubmit: (data: any) => void;
    isSubmitting?: boolean;
    mode?: "create" | "update";
    onCancel?: () => void;
    formData?: FormData;
}

// Componente de sección con ícono
const SectionHeader = ({ icon: Icon, title, badge }: { icon: any; title: string; badge?: string }) => (
    <div className="flex items-center gap-2">
        <Icon className="size-4 text-primary" />
        <span className="text-sm font-medium">{title}</span>
        {badge && (
            <Badge variant="outline" className="text-xs h-5 px-1.5">
                {badge}
            </Badge>
        )}
    </div>
);

export const VehiculoForm = ({
    defaultValues,
    onSubmit,
    isSubmitting = false,
    mode = "create",
    onCancel,
    formData,
}: VehiculoFormProps) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const schema = mode === "create" ? vehiculoSchemaCreate : vehiculoSchemaUpdate;

    const baseDefaultValues = {
        tipo_vehiculo_id: undefined,
        placa: "",
        modelo: "",
        marca: "",
        serie_chasis: "",
        motor: "",
        num_mtc: "",
        tarjeta_circulacion: "",
        kilometraje: undefined,
        tercero: 0,
        capacidad: undefined,
        capacidad_bruta: undefined,
        reserva: undefined,
        capacidad_util: undefined,
        vehiculo_status: 1,
        status_geotab_km: 0,
        status_matpel: 1,
        status_ubicacion: 1,
        sede_id: undefined,
    };

    const updateDefaultValues = mode === "update" ? {
        ult_manteniento_realizado: undefined,
        km_mantenimiento: undefined,
    } : {};

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            ...baseDefaultValues,
            ...updateDefaultValues,
            ...defaultValues,
        },
        mode: "onChange",
    });

    const handleNumberChange = (field: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const numValue = value === "" ? undefined : parseFloat(value);
        field.onChange(isNaN(numValue!) ? value : numValue);
    };

    const vehicleTypeOptions = formData?.vehicleTypes.map((item) => ({
        label: item.descripcion,
        value: item.id,
    })) || [];

    const sedeOptions = formData?.sedes.map((item) => ({
        label: item.abreviatura,
        value: item.id,
    })) || [];

    const statusOptions = [
        { label: "Activo", value: "1" },
        { label: "Inactivo", value: "0" },
    ];

    const terceroOptions = [
        { label: "No", value: "0" },
        { label: "Sí", value: "1" },
    ];

    const control = form.control;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Sección 1: Información Básica */}
                <div className="space-y-2">
                    <SectionHeader icon={Car} title="Información del Vehículo" badge="Obligatorio" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-muted/10 rounded-lg p-3">
                        <FormSelect
                            control={control}
                            name="sede_id"
                            label={() => (
                                <div className="flex items-center gap-1.5"><Building2 className="size-3.5" /> Sede</div>
                            )}
                            placeholder="Seleccione"
                            options={sedeOptions}
                            isSearchable={true}
                        />

                        <FormSelect
                            control={control}
                            name="tipo_vehiculo_id"
                            label={() => (
                                <div className="flex items-center gap-1.5">
                                    <Truck className="size-3.5" />
                                    Tipo
                                </div>
                            )}
                            placeholder="Seleccione"
                            options={vehicleTypeOptions}
                            isSearchable={true}
                        />

                        <FormField
                            control={control}
                            name="placa"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1.5">
                                        <Hash className="size-3.5" /> Placa <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="ABC-123"
                                            {...field}
                                            className="uppercase font-mono"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="modelo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1.5">
                                        <Calendar className="size-3.5" /> Modelo
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="2020" {...field} value={field.value ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="marca"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1.5">
                                        <Tags className="size-3.5" /> Marca
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Toyota" {...field} value={field.value ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormSelect
                            control={control}
                            name="tercero"
                            label={() => (
                                <div className="flex items-center gap-1.5"><Users className="size-3.5" /> Tercero</div>
                            )}
                            placeholder="Seleccione"
                            options={terceroOptions}
                        />
                    </div>
                </div>

                <Separator className="my-1" />

                {/* Sección 2: Capacidades */}
                <div className="space-y-2">
                    <SectionHeader icon={Weight} title="Capacidades" badge="Opcional" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-muted/10 rounded-lg p-3">
                        <FormField
                            control={control}
                            name="capacidad"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1.5">
                                        <Weight className="size-3.5" /> Capacidad
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={handleNumberChange(field)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="capacidad_bruta"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1.5">
                                        <Weight className="size-3.5" /> Cap. Bruta
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={handleNumberChange(field)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="reserva"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1.5">
                                        <Fuel className="size-3.5" /> Reserva
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={handleNumberChange(field)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="capacidad_util"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1.5">
                                        <Gauge className="size-3.5" /> Cap. Útil
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={handleNumberChange(field)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <Separator className="my-1" />

                {/* Sección 3: Estados */}
                <div className="space-y-2">
                    <SectionHeader icon={CircleCheck} title="Estados" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-muted/10 rounded-lg p-3">
                        <FormSelect
                            control={control}
                            name="vehiculo_status"
                            label={() => (
                                <div className="flex items-center gap-1.5"><CircleCheck className="size-3.5 text-green-500" /> Estado</div>
                            )}
                            placeholder="Seleccione"
                            options={statusOptions}
                        />

                        <FormSelect
                            control={control}
                            name="status_geotab_km"
                            label={() => (
                                <div className="flex items-center gap-1.5"><Gauge className="size-3.5" /> Status KM</div>
                            )}
                            placeholder="Seleccione"
                            options={[
                                { label: "Automático", value: "1" },
                                { label: "Manual", value: "0" },
                            ]}
                        />

                        <FormSelect
                            control={control}
                            name="status_matpel"
                            label={() => (
                                <div className="flex items-center gap-1.5"><CircleCheck className="size-3.5" /> Status Matpel</div>
                            )}
                            placeholder="Seleccione"
                            options={statusOptions}
                        />

                        <FormSelect
                            control={control}
                            name="status_ubicacion"
                            label={() => (<div className="flex items-center gap-1.5"><MapPin className="size-3.5" /> Status Ubicación</div>)}
                            placeholder="Seleccione"
                            options={statusOptions}
                        />
                    </div>
                </div>

                {/* Sección 4: Campos adicionales - UPDATE */}
                {mode === "update" && (
                    <>
                        <Separator className="my-1" />
                        <div className="space-y-2">
                            <SectionHeader icon={Calendar} title="Mantenimiento" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-muted/10 rounded-lg p-3">
                                <FormField
                                    control={control}
                                    name={"ult_manteniento_realizado" as any}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1.5">
                                                <Calendar className="size-3.5" /> Último Mantenimiento
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} value={field.value ?? ""} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name={"km_mantenimiento" as any}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1.5">
                                                <Gauge className="size-3.5" /> KM Mantenimiento
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={handleNumberChange(field)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* Sección 5: Campos avanzados (colapsable) */}
                <div>
                    <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Settings2 className="size-3.5" />
                        {showAdvanced ? "Ocultar" : "Mostrar"} campos avanzados
                        {showAdvanced ? (
                            <ChevronUp className="size-3" />
                        ) : (
                            <ChevronDown className="size-3" />
                        )}
                    </button>

                    {showAdvanced && (
                        <div className="mt-3 space-y-2">
                            <SectionHeader icon={FileText} title="Especificaciones Técnicas" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-muted/10 rounded-lg p-3">
                                <FormField
                                    control={control}
                                    name="serie_chasis"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs flex items-center gap-1.5">
                                                <Ruler className="size-3" /> Serie Chasis
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Serie"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    className="h-8 text-sm"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name="motor"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs flex items-center gap-1.5">
                                                <Gauge className="size-3" /> Motor
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Motor"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    className="h-8 text-sm"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name="num_mtc"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs flex items-center gap-1.5">
                                                <FileText className="size-3" /> N° MTC
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="MTC"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    className="h-8 text-sm"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name="tarjeta_circulacion"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs flex items-center gap-1.5">
                                                <FileText className="size-3" /> Tarjeta Circulación
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Tarjeta"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    className="h-8 text-sm"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name="kilometraje"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs flex items-center gap-1.5">
                                                <Gauge className="size-3" /> Kilometraje
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={handleNumberChange(field)}
                                                    className="h-8 text-sm"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="gap-1.5"
                    >
                        <CircleX className="size-3.5" />
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={isSubmitting || !form.formState.isValid}
                        className="gap-1.5"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader className="size-3.5 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <CircleCheck className="size-3.5" />
                                Guardar
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
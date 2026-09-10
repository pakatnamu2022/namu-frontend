"use client";

import { useForm, useWatch } from "react-hook-form";
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
import { Switch } from "@/components/ui/switch";
import {
    Loader,
    Fuel,
    Printer,
    ChevronRight,
    ChevronLeft,
    CheckCircle,
    FileText,
    Images,
    Ticket,
    Gauge,
    MapPin,
} from "lucide-react";
import { supplySchemaCreate, supplySchemaUpdate } from "../lib/supplyControl.schema";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { getDefaultIsBase } from "../lib/supplyTicket.helpers";
import { useUserComplete } from "@/features/gp/gestionsistema/usuarios/lib/user.hook";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { PhotoUploadField } from "./PhotoUploadField";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Controller } from "react-hook-form";
import { SupplyFormProps } from "../lib/supplyControl.interface";


const STEPS = [
    {
        id: 1,
        label: "Datos",
        icon: FileText,
        description: "Información del abastecimiento"
    },
    {
        id: 2,
        label: "Fotos Tanques",
        icon: Images,
        description: "Foto de cada tanque"
    },
    {
        id: 3,
        label: "Ticket",
        icon: Ticket,
        description: "Foto del vale/ticket"
    },
] as const;

export const SupplyForm = ({
    defaultValues,
    onSubmit,
    isSubmitting = false,
    mode = "create",
    onCancel,
    vehicles = [],
    drivers = [],
    suppliers = [],
    isDriver = false,
    isAssistant = false,
    driverId = null,
}: SupplyFormProps) => {
    const { user } = useAuthStore();
    const { data: userComplete } = useUserComplete(user.id);
    const [currentStep, setCurrentStep] = useState(0);
    const hasAutoSubmitted = useRef(false);
    const isMounted = useRef(true);

    const defaultDate = new Date();
    const defaultFormattedDate = `${defaultDate.getFullYear()}-${String(defaultDate.getMonth() + 1).padStart(2, '0')}-${String(defaultDate.getDate()).padStart(2, '0')}T${String(defaultDate.getHours()).padStart(2, '0')}:${String(defaultDate.getMinutes()).padStart(2, '0')}`;

    const form = useForm<any>({
        resolver: zodResolver(
            mode === "create" ? supplySchemaCreate : supplySchemaUpdate
        ),
        defaultValues: {
            is_base: true,
            recorded_at: defaultFormattedDate,
            ...defaultValues,
            ...(isDriver && driverId ? { driver_id: driverId } : {}),
        },
        mode: "onChange",
    });

    const [_photoPreview, _setPhotoPreview] = useState<string | null>(null);
    const [_photoBase64, _setPhotoBase64] = useState<string | null>(null);

    const supplierId = useWatch({
        control: form.control,
        name: "supplier_id",
    });

    const isBase = useWatch({
        control: form.control,
        name: "is_base",
    });

    const selectedSupplier = useMemo(() => {
        if (!supplierId) return null;
        return suppliers.find(s => String(s.id) === String(supplierId)) || null;
    }, [supplierId, suppliers]);

    const shouldBeBase = useMemo(() => {
        return selectedSupplier ? getDefaultIsBase(selectedSupplier.name) : null;
    }, [selectedSupplier]);

    useEffect(() => {
        if (
            mode === "create" &&
            shouldBeBase !== null &&
            shouldBeBase !== isBase
        ) {
            form.setValue("is_base", shouldBeBase);
        }
    }, [shouldBeBase, isBase, mode, form]);

    useEffect(() => {
        const shouldAutoSubmit =
            currentStep === 2 &&
            isBase &&
            mode === "create" &&
            !isSubmitting &&
            !hasAutoSubmitted.current;

        if (shouldAutoSubmit) {
            hasAutoSubmitted.current = true;

            const timeoutId = setTimeout(() => {
                if (isMounted.current) {
                    form.handleSubmit((data) => {
                        onSubmit({ ...data, is_base: Boolean(data.is_base) });
                    })();
                }
            }, 500);

            return () => clearTimeout(timeoutId);
        }
    }, [currentStep, isBase, mode, isSubmitting, form, onSubmit]);

    useEffect(() => {
        hasAutoSubmitted.current = false;
    }, [mode]);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const driverName = useMemo(() => {
        const found = drivers.find(d => d.id === driverId);
        if (found) return found.nombre_completo;
        if (userComplete?.name) return userComplete.name;
        return "Cargando...";
    }, [drivers, driverId, userComplete?.name]);


    const validateStep = useCallback((step: number): boolean => {
        const values = form.getValues();

        switch (step) {
            case 0: {
                const missingFields: string[] = [];
                if (!values.vehicle_id) missingFields.push("Vehículo");
                if (!values.supplier_id) missingFields.push("Grifo");
                if (!values.mileage || values.mileage <= 0) missingFields.push("Kilometraje");
                if (!values.gallons || values.gallons <= 0) missingFields.push("Galones");

                if (missingFields.length > 0) {
                    toast.error(`Por favor completa: ${missingFields.join(", ")}`);
                    return false;
                }
                return true;
            }
            case 1: {
                if (!values.tank_left_photo) {
                    toast.error("Por favor, toma o sube la foto del tanque izquierdo");
                    return false;
                }
                if (!values.tank_right_photo) {
                    toast.error("Por favor, toma o sube la foto del tanque derecho");
                    return false;
                }
                return true;
            }
            case 2: {
                if (!isBase) {
                    const ticketPhoto = values.ticket_photo;
                    if (!ticketPhoto || ticketPhoto.trim() === '') {
                        toast.error("Por favor, toma o sube la foto del ticket (obligatorio para registros fuera de base)");
                        return false;
                    }
                    if (ticketPhoto.length < 100) {
                        toast.error("La foto del ticket no es válida. Por favor, toma una foto clara.");
                        return false;
                    }
                }
                return true;
            }
            default:
                return true;
        }
    }, [form, isBase]);

    const goToNextStep = useCallback(() => {
        if (validateStep(currentStep)) {
            if (currentStep < STEPS.length - 1) {
                setCurrentStep(currentStep + 1);
            }
        }
    }, [currentStep, validateStep]);

    const goToPreviousStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    }, [currentStep]);

    const goToStep = useCallback((step: number) => {
        if (step < currentStep) {
            setCurrentStep(step);
        } else if (step > currentStep) {
            let canAdvance = true;
            for (let i = currentStep; i < step; i++) {
                if (!validateStep(i)) {
                    canAdvance = false;
                    break;
                }
            }
            if (canAdvance) {
                setCurrentStep(step);
            }
        }
    }, [currentStep, validateStep]);


    const handleSubmitForm = useCallback(form.handleSubmit((data) => {
        if (!data.is_base && !data.ticket_photo) {
            toast.error("El ticket es obligatorio para registros fuera de base");
            setCurrentStep(2);
            return;
        }
        onSubmit({ ...data, is_base: Boolean(data.is_base) });
    }), [form, onSubmit]);

    const CurrentIcon = STEPS[currentStep]?.icon || FileText;

    return (
        <Form {...form}>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmitForm(e);
            }} className="w-full">
                <div className="flex items-center justify-between gap-1 mb-6 px-1">
                    {STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = currentStep > index;
                        const isActive = currentStep === index;

                        return (
                            <div
                                key={step.id}
                                className="flex flex-1 items-center gap-2"
                            >
                                <button
                                    type="button"
                                    onClick={() => goToStep(index)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all flex-1 justify-center",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-md"
                                            : isCompleted
                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    )}
                                    disabled={isSubmitting}
                                >
                                    {isCompleted ? (
                                        <CheckCircle className="h-4 w-4" />
                                    ) : (
                                        <Icon className="h-4 w-4" />
                                    )}
                                    <span className="hidden sm:inline">{step.label}</span>
                                </button>
                                {index < STEPS.length - 1 && (
                                    <div className="hidden sm:block flex-1 h-0.5 bg-muted">
                                        <div
                                            className={cn(
                                                "h-full transition-all duration-300",
                                                currentStep > index ? "bg-primary w-full" : "w-0"
                                            )}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Título del paso actual */}
                <div className="flex items-center gap-3 mb-4 pb-2 border-b">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <CurrentIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">
                            Paso {currentStep + 1}: {STEPS[currentStep]?.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {STEPS[currentStep]?.description}
                        </p>
                    </div>
                </div>

                {/* Contenido del paso actual */}
                <div className="min-h-[300px]">
                    {/* Paso 1: Datos */}
                    {currentStep === 0 && (
                        <div className="space-y-4">
                            {/* Conductor - Solo visible para asistentes */}
                            {isAssistant ? (
                                <FormSelect
                                    control={form.control}
                                    name="driver_id"
                                    label="Conductor"
                                    placeholder="Buscar conductor..."
                                    options={drivers.map((d) => ({
                                        label: `${d.nombre_completo} (${d.vat})`,
                                        value: String(d.id),
                                    }))}
                                    isSearchable={true}
                                    strictFilter={true}
                                    startsWith={false}
                                    required
                                />
                            ) : (
                                <div className="p-3 bg-muted/30 rounded-lg border">
                                    <p className="text-sm text-muted-foreground">Conductor</p>
                                    <p className="font-semibold">
                                        {driverName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Registro automático como conductor
                                    </p>
                                </div>
                            )}

                            {/* Vehículo */}
                            <FormSelect
                                control={form.control}
                                name="vehicle_id"
                                label="Vehículo"
                                placeholder="Buscar vehículo por placa..."
                                options={vehicles.map((v) => ({
                                    label: `${v.placa}`,
                                    value: String(v.id),
                                }))}
                                isSearchable={true}
                                strictFilter={true}
                                startsWith={false}
                                required
                            />

                            {/* Grifo */}
                            <FormSelect
                                control={form.control}
                                name="supplier_id"
                                label="Grifo"
                                placeholder="Seleccione un grifo"
                                options={suppliers.map((s) => ({
                                    label: s.name,
                                    value: String(s.id),
                                }))}
                                isSearchable={true}
                                strictFilter={true}
                                startsWith={false}
                                required
                            />

                            {/* Kilometraje y Galones */}
                            <div className="grid grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name="mileage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Kilometraje <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                        <Gauge className="h-4 w-4" />
                                                    </span>
                                                    <Input
                                                        type="number"
                                                        step="1"
                                                        placeholder="Km"
                                                        {...field}
                                                        className="pl-10"
                                                        value={field.value === undefined ? '' : field.value}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            const numValue = value === '' ? undefined : parseFloat(value);
                                                            field.onChange(isNaN(numValue!) ? value : numValue);
                                                        }}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="gallons"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Galones <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                        <Fuel className="h-4 w-4" />
                                                    </span>
                                                    <Input
                                                        type="number"
                                                        step="0.001"
                                                        placeholder="Galones"
                                                        {...field}
                                                        className="pl-10"
                                                        value={field.value === undefined ? '' : field.value}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            const numValue = value === '' ? undefined : parseFloat(value);
                                                            field.onChange(isNaN(numValue!) ? value : numValue);
                                                        }}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Ubicación y Fecha/Hora */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name="is_base"
                                    render={({ field }) => {
                                        const isBaseLocked = mode === "create" && selectedSupplier && getDefaultIsBase(selectedSupplier.name);

                                        return (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-sm">Ubicación</FormLabel>
                                                    <p className="text-xs text-muted-foreground">
                                                        {field.value ? "En Base" : "Fuera de Base"}
                                                    </p>
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                                        {selectedSupplier && getDefaultIsBase(selectedSupplier.name) && (
                                                            <span className="text-[10px] text-blue-600">
                                                                Auto-detectado
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={isBaseLocked === true}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        );
                                    }}
                                />

                                <FormField
                                    control={form.control}
                                    name="recorded_at"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha y Hora</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type="datetime-local"
                                                        {...field}
                                                        value={field.value || ''}
                                                        className="pl-4 h-11"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <Controller
                                control={form.control}
                                name="tank_left_photo"
                                render={({ field }) => (
                                    <PhotoUploadField
                                        label="Tanque Izquierdo"
                                        value={field.value}
                                        onChange={(base64) => {
                                            field.onChange(base64 || undefined);
                                        }}
                                        required
                                        placeholder="Toma foto o sube de galería"
                                        description="Foto del tanque izquierdo"
                                        disabled={isSubmitting}
                                    />
                                )}
                            />

                            <Controller
                                control={form.control}
                                name="tank_right_photo"
                                render={({ field }) => (
                                    <PhotoUploadField
                                        label="Tanque Derecho"
                                        value={field.value}
                                        onChange={(base64) => {
                                            field.onChange(base64 || undefined);
                                        }}
                                        required
                                        placeholder="Toma foto o sube de galería"
                                        description="Foto del tanque derecho"
                                        disabled={isSubmitting}
                                    />
                                )}
                            />
                        </div>
                    )}

                    {/* Paso 3: Ticket */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <div className="bg-muted/20 rounded-lg p-4 text-center">
                                <Ticket className="h-6 w-6 mx-auto mb-2 text-primary" />
                                <p className="text-sm font-medium">Foto del Vale / Ticket</p>
                                <p className="text-xs text-muted-foreground">
                                    {isBase
                                        ? "El ticket se imprimirá después de guardar"
                                        : "Sube la foto del ticket (obligatorio)"}
                                </p>
                            </div>

                            {isBase ? (
                                <div className="p-6 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
                                    <Printer className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                        El ticket se imprimirá después de guardar
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                        Luego podrás tomar foto del ticket firmado y subirla
                                    </p>
                                </div>
                            ) : (
                                <Controller
                                    control={form.control}
                                    name="ticket_photo"
                                    rules={{
                                        required: "La foto del ticket es obligatoria para registros fuera de base",
                                        validate: (value) => {
                                            if (!value || value.trim() === '') {
                                                return "Debes tomar o subir una foto del ticket";
                                            }
                                            if (value.length < 100) {
                                                return "La foto no es válida. Por favor, toma una foto clara del ticket";
                                            }
                                            return true;
                                        }
                                    }}
                                    render={({ field, fieldState }) => (
                                        <div>
                                            <PhotoUploadField
                                                label="Ticket del Vale"
                                                value={field.value}
                                                onChange={(base64) => {
                                                    console.log('📸 [SupplyForm] ticket_photo changed:', base64 ? 'present' : 'null');
                                                    field.onChange(base64 || undefined);
                                                    if (base64) {
                                                        form.trigger('ticket_photo');
                                                    }
                                                }}
                                                placeholder="Toma foto del ticket o sube de galería"
                                                description="Foto del ticket de combustible (JPG, PNG, PDF) - Obligatorio"
                                                accept="image/*,application/pdf"
                                                disabled={isSubmitting}
                                                required
                                            />
                                            {fieldState.error && (
                                                <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p>
                                            )}
                                        </div>
                                    )}
                                />
                            )}
                        </div>
                    )}


                </div>

                {/* Botones de navegación */}
                <div className="flex justify-between gap-3 pt-6 border-t mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={goToPreviousStep}
                        disabled={currentStep === 0 || isSubmitting}
                        className="gap-2"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                    </Button>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>

                        {currentStep === STEPS.length - 1 ? (
                            <Button
                                type="submit"
                                disabled={isSubmitting || !form.formState.isValid}
                                className="min-w-[120px] gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader className="h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    mode === "create" ? "Registrar" : "Actualizar"
                                )}
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={goToNextStep}
                                disabled={isSubmitting}
                                className="gap-2"
                            >
                                Siguiente
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Indicador de progreso (móvil) */}
                <div className="sm:hidden flex justify-center gap-1 mt-4">
                    {STEPS.map((_, index) => (
                        <div
                            key={index}
                            className={cn(
                                "h-1.5 rounded-full transition-all duration-300",
                                currentStep === index
                                    ? "w-8 bg-primary"
                                    : currentStep > index
                                        ? "w-4 bg-green-500"
                                        : "w-4 bg-muted"
                            )}
                        />
                    ))}
                </div>
            </form>
        </Form>
    );
};
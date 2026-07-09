"use client";

import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";

const STATUS_OPTIONS = [
    { value: "all", label: "Todos" },
    { value: "1", label: "Activo" },
    { value: "0", label: "Inactivo" },
];

const VEHICULO_STATUS_OPTIONS = [
    { value: "all", label: "Todos" },
    { value: "1", label: "Activo" },
    { value: "0", label: "Inactivo" },
];

interface VehiculoOptionsProps {
    search: string;
    setSearch: (value: string) => void;
    status: string;
    setStatus: (value: string) => void;
    vehiculoStatus: string;
    setVehiculoStatus: (value: string) => void;
    tipoVehiculoId?: string;
    setTipoVehiculoId?: (value: string) => void;
    sedeId?: string;
    setSedeId?: (value: string) => void;
    vehicleTypes?: Array<{ id: string; descripcion: string }>;
    sedes?: Array<{ id: string; abreviatura: string; descripcion: string }>;
}

export default function VehiculoOptions({
    search,
    setSearch,
    status,
    setStatus,
    vehiculoStatus,
    setVehiculoStatus,
    tipoVehiculoId,
    setTipoVehiculoId,
    sedeId,
    setSedeId,
    vehicleTypes = [],
    sedes = [],
}: VehiculoOptionsProps) {
    const tipoVehiculoOptions = [
        { value: "", label: "Todos los tipos" },
        ...vehicleTypes.map((item) => ({
            value: item.id,
            label: item.descripcion,
        })),
    ];

    const sedeOptions = [
        { value: "", label: "Todas las sedes" },
        ...sedes.map((item) => ({
            value: item.id,
            label: `${item.abreviatura} - ${item.descripcion}`,
        })),
    ];

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Buscar vehículo..."
            />
            <SearchableSelect
                onChange={setStatus}
                value={status}
                options={STATUS_OPTIONS}
                placeholder="Estado"
            />
            <SearchableSelect
                onChange={setVehiculoStatus}
                value={vehiculoStatus}
                options={VEHICULO_STATUS_OPTIONS}
                placeholder="Estado Vehículo"
            />
            {setTipoVehiculoId && (
                <SearchableSelect
                    onChange={setTipoVehiculoId}
                    value={tipoVehiculoId || ""}
                    options={tipoVehiculoOptions}
                    placeholder="Tipo Vehículo"
                />
            )}
            {setSedeId && (
                <SearchableSelect
                    onChange={setSedeId}
                    value={sedeId || ""}
                    options={sedeOptions}
                    placeholder="Sede"
                />
            )}
        </div>
    );
}
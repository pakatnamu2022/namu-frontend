"use client";

import { SearchableSelect } from "@/shared/components/SearchableSelect";
import SearchInput from "@/shared/components/SearchInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SupplyControlOptionsProps } from "../lib/supplyControl.interface";
import { SUPPLY_BASE_OPTIONS } from "../lib/supplyControl.constants";

export default function SupplyOptions({
    search,
    setSearch,
    vehicleId,
    setVehicleId,
    supplierId,
    setSupplierId,
    isBase = "all",
    setIsBase,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    suppliers,
    vehicles,
}: SupplyControlOptionsProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Buscar por placa, conductor, grifo..."
                className="min-w-[200px]"
            />

            <SearchableSelect
                onChange={(value) => setVehicleId(value as string)}
                value={vehicleId}
                options={[
                    { value: "", label: "Todos los vehículos" },
                    ...vehicles.map((v) => ({
                        value: String(v.id),
                        label: v.placa,
                    })),
                ]}
                placeholder="Vehículo"
                className="min-w-[140px]"
            />

            <SearchableSelect
                onChange={(value) => setSupplierId(value as string)}
                value={supplierId}
                options={[
                    { value: "", label: "Todos los grifos" },
                    ...suppliers.map((s) => ({
                        value: String(s.id),
                        label: s.name,
                    })),
                ]}
                placeholder="Grifo"
                className="min-w-[140px]"
            />

            <SearchableSelect
                onChange={(value) => setIsBase(value as string)}
                value={isBase}
                options={SUPPLY_BASE_OPTIONS}
                placeholder="Ubicación"
                className="min-w-[130px]"
            />

            <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Desde</Label>
                <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-[130px] h-9"
                />
            </div>

            <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Hasta</Label>
                <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-[130px] h-9"
                />
            </div>
        </div>
    );
}
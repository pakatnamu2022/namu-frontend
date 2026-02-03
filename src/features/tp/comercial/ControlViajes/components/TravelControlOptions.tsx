"use client";

import { SearchableSelect } from "@/shared/components/SearchableSelect";
import SearchInput from "@/shared/components/SearchInput";
import { TravelControlOptionsProps, TripStatus } from "@/features/tp/comercial/ControlViajes/lib/travelControl.interface";


const STATUS_OPTIONS =[
    {value: "all", label: "Todos"},
    {value:"pending", label: "Pendientes"},
    {value: "in_progress", label: "En Ruta"},
    {value: "completed", label: "Completados"},
    {value: "fuel_pending", label:"Combustible Pendiente"},
];

export default function TravelControlOptions({
    search,
    setSearch,
    status,
    setStatus,
    userPosition="CONDUCTOR DE TRACTO CAMION",
}: TravelControlOptionsProps){

    const getFilteredOptions = () =>{
        if(userPosition === "GESTOR COMERCIAL"){
            return STATUS_OPTIONS.filter(option =>
            ["all", "fuel_pending", "completed"].includes(option.value)
            );
        }
        return STATUS_OPTIONS;
    };

    return(
        <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por número, cliente o ruta..."
      />
      <SearchableSelect
        onChange={(value) => setStatus(value as TripStatus | "all")}
        value={status}
        options={getFilteredOptions()}
        placeholder="Estado del viaje"
      />
    </div>
    );
}


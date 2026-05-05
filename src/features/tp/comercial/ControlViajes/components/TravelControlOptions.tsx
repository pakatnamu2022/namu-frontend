"use client";

import { SearchableSelect } from "@/shared/components/SearchableSelect";
import SearchInput from "@/shared/components/SearchInput";
import { TravelControlOptionsProps, TripStatus } from "@/features/tp/comercial/ControlViajes/lib/travelControl.interface";
import { useExportAllTravelsReport, useExportSummaryReport } from "../lib/travelControl.hooks";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Sheet } from "lucide-react";


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
    userPosition = "CONDUCTOR DE TRACTO CAMION",
}: TravelControlOptionsProps){

    const { mutate: exportAllReports, isPending: isExporting } = useExportAllTravelsReport();
    const { mutate: exportSummaryReport, isPending: isExportingSummary } = useExportSummaryReport();

    const handleExportSummary = (format: 'excel' | 'pdf') => {
        const filters: any = {};
        if (search) filters.search = search;
        if (status && status !== 'all') filters.status = status;
        
        exportSummaryReport({ format, filters });
    }

    const handleExportAll = (format: 'excel' | 'pdf') => {
        const filters: any = {};
        if (search) filters.search = search;
        if (status && status !== 'all') filters.status = status;
        
        exportAllReports({ format, filters });
    };

    const getFilteredOptions = () =>{
        if(userPosition === "GESTOR COMERCIAL" || userPosition === "ASISTENTE DE OPERACIONES"){
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
      {/* Botón de exportación general */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2" disabled={isExporting}>
                        {isExporting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        Exportar Reporte General
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExportAll('excel')}>
                        <Sheet /> Exportar a Excel
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant='outline' size="sm" className="gap-2" disabled={isExportingSummary}>
                        {isExportingSummary ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ): (
                            <Download className="h-4 w-4" />
                        )}
                        Exportar Reporte viajes
                    </Button>

                </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                 <DropdownMenuItem onClick={() => handleExportSummary('excel')}  >
                    <Sheet /> Exportar a excel
                </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
    </div>
    );
}


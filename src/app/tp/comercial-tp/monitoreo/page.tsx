
"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useCallback, useEffect, useMemo, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { DriverResource, DriverStatus, ViewMode } from "@/features/tp/comercial/Monitoreo/lib/monitoreo.interface";
import { useDrivers, useDriverStats } from "@/features/tp/comercial/Monitoreo/lib/monitoreo.hooks";
import { StatsBar } from "@/features/tp/comercial/Monitoreo/components/StatsBar";
import { FleetToolbar } from "@/features/tp/comercial/Monitoreo/components/FleetToolbar";
import { DriverTable } from "@/features/tp/comercial/Monitoreo/components/DriverTable";
import { ViewToggle } from "@/features/tp/comercial/Monitoreo/components/ViewToggle";
import { MapView } from "@/features/tp/comercial/Monitoreo/components/MapView";
import { MonitorSidebar } from "@/features/tp/comercial/Monitoreo/components/MonitorSidebar";
import { RouteHistoryModal } from "@/features/tp/comercial/Monitoreo/components/RouteHistoryModal";

function useResponsiveView(initialViewMode: ViewMode) {
    const [isMobile, setIsMobile] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);


    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 640;
            setIsMobile(mobile);

            if (mobile && viewMode === "map") {
                setViewMode("list");
            }
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, [viewMode]);

    return { isMobile, viewMode, setViewMode };
}

function useFilters() {
    const [page, setPage] = useState(1);
    const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<DriverStatus | "all">("all");
    const resetPage = useCallback(() => setPage(1), []);

    useEffect(() => {
        resetPage();
    }, [search, status, resetPage]);

    return { page, setPage, per_page, setPerPage, search, setSearch, status, setStatus };
}

function useMapState(_isMobile: boolean, _viewMode: ViewMode) {
    const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
    const [focusTarget, setFocusTarget] = useState<{ id: number; ts: number } | null>(null);
    const [sidebarFilter, setSidebarFilter] = useState<"all" | DriverStatus>("all");

    const handleSelectDriver = useCallback((id: number) => {
        setSelectedDriverId(id);
        setFocusTarget({ id, ts: Date.now() });
    }, []);

    const handleCenterDriver = useCallback((id: number) => {
        setFocusTarget({ id, ts: Date.now() });
    }, []);

    return {
        selectedDriverId,
        focusTarget,
        sidebarFilter,
        setSidebarFilter,
        handleSelectDriver,
        handleCenterDriver,
    };
}

export default function MonitoreoPage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
    const { page, setPage, per_page, setPerPage, search, setSearch, status, setStatus } = useFilters();
    const { isMobile, viewMode, setViewMode } = useResponsiveView("list");
    const { selectedDriverId, focusTarget, sidebarFilter, setSidebarFilter, handleSelectDriver, handleCenterDriver } = useMapState(isMobile, viewMode);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [historyDriver, setHistoryDriver] = useState<DriverResource | null>(null);

    const { data: driversData, isLoading: isLoadingDrivers, refetch: refetchDrivers } = useDrivers({
        page,
        search,
        status,
        per_page,
    });
    const { data: statsData, isLoading: isLoadingStats, refetch: refetchStats } = useDriverStats();
    const drivers = useMemo(() => driversData?.data || [], [driversData]);
    const total = driversData?.total || 0;
    const lastPage = driversData?.last_page || 1;


    const counts = useMemo(() => ({
        all: driversData?.total || 0,
        active: drivers.filter(d => d.status === "active").length,
        inactive: drivers.filter(d => d.status === "inactive").length,
        disconnected: drivers.filter(d => d.status === "disconnected").length,
        nodata: drivers.filter(d => d.status === "nodata").length,
    }), [driversData, drivers]);

    const handleShowHistory = useCallback((id: number) => {
        const driver = drivers.find(d => d.id === id);
        setHistoryDriver(driver || null);
    }, [drivers]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await Promise.all([refetchDrivers(), refetchStats()]);
        setLastRefresh(new Date());
        setIsRefreshing(false);
    }, [refetchDrivers, refetchStats]);

    const handleViewOnMap = useCallback((driver: DriverResource) => {
        if (driver.last_location?.google_maps_url) {
            window.open(driver.last_location.google_maps_url, "_blank");
        }
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            refetchDrivers();
            refetchStats();
        }, 10000); // Cada 10 segundos

        return () => clearInterval(interval);
    }, [refetchDrivers, refetchStats]);

    if (isLoadingModule) return <PageSkeleton />;
    if (!checkRouteExists("monitoreo")) notFound();
    if (!currentView) notFound();

    return (
        <div className="space-y-3 sm:space-y-4">
            <HeaderTableWrapper>

                <TitleComponent
                    title={`${currentView.descripcion || "Monitoreo de Flota"}`}
                    subtitle="Ubicación en tiempo real de los conductores"
                    icon={currentView.icon}
                />

                <ViewToggle view={viewMode} onViewChange={setViewMode} />

            </HeaderTableWrapper>

            <StatsBar stats={statsData} isLoading={isLoadingStats} />

            <FleetToolbar
                search={search}
                setSearch={setSearch}
                status={status}
                setStatus={setStatus}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
                lastRefresh={lastRefresh}
            />

            { /* VISTA LISTA (TABLA) */}
            {viewMode === "list" && (
                <>
                    <DriverTable
                        drivers={drivers}
                        isLoading={isLoadingDrivers}
                        onViewOnMap={handleViewOnMap}
                        onRefresh={handleRefresh}
                    />
                    <DataTablePagination
                        page={page}
                        totalPages={lastPage}
                        onPageChange={setPage}
                        per_page={per_page}
                        setPerPage={setPerPage}
                        totalData={total}
                    />
                </>
            )}

            {/*VISTA MAPA (MAPA + SIDEBAR) */}
            {viewMode === "map" && (
                <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
                    <div className="w-full lg:flex-1 lg:col-span-2">
                        <div className="h-[500px] sm:h-[550px] lg:h-[600px] w-full rounded-lg overflow-hidden border border-border shadow-sm">
                            <MapView
                                drivers={drivers}
                                selectedId={selectedDriverId ? String(selectedDriverId) : null}
                                onSelect={(id) => handleSelectDriver(Number(id))}
                                onShowHistory={(id) => handleShowHistory(Number(id))}
                                focusTarget={focusTarget ? { id: String(focusTarget.id), ts: focusTarget.ts } : null}
                            />
                        </div>

                    </div>
                    {!isMobile ? (
                        <div className="lg:w-[360px]">
                            <MonitorSidebar
                                drivers={drivers}
                                counts={counts}
                                search={search}
                                onSearchChange={setSearch}
                                filter={sidebarFilter}
                                onFilterChange={setSidebarFilter}
                                selectedId={selectedDriverId}
                                onSelect={handleSelectDriver}
                                onCenter={handleCenterDriver}
                                onHistory={handleShowHistory}
                            />
                        </div>
                    ) : (
                        <div className="w-full mt-3">
                            <details className="bg-card rounded-lg border border-border">
                                <summary className="cursor-pointer p-3 font-medium text-sm flex items-center justify-between">
                                    <span>📋 Lista de conductores ({drivers.length})</span>
                                    <span className="text-xs text-muted-foreground">▼</span>
                                </summary>
                                <div className="p-2 max-h-[400px] overflow-auto">
                                    <MonitorSidebar
                                        drivers={drivers}
                                        counts={counts}
                                        search={search}
                                        onSearchChange={setSearch}
                                        filter={sidebarFilter}
                                        onFilterChange={setSidebarFilter}
                                        selectedId={selectedDriverId}
                                        onSelect={handleSelectDriver}
                                        onCenter={handleCenterDriver}
                                        onHistory={handleShowHistory}
                                    />
                                </div>
                            </details>
                        </div>
                    )}
                </div>
            )}

            {/* Modal de historial */}
            <RouteHistoryModal
                driver={historyDriver}
                open={!!historyDriver}
                onOpenChange={(open) => !open && setHistoryDriver(null)}
            />
        </div>
    )
};
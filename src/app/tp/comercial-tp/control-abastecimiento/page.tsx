"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useCallback, useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { useUserComplete } from "@/features/gp/gestionsistema/usuarios/lib/user.hook";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { Button } from "@/components/ui/button";
import { Plus, Fuel } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useActiveSuppliers, useDeleteSupply, useSupplies, useSupplyStats } from "@/features/tp/comercial/ControlGrifo/lib/supplyControl.hooks";
import { SupplyControlColumns } from "@/features/tp/comercial/ControlGrifo/components/SupplyControlColumns";
import SupplyOptions from "@/features/tp/comercial/ControlGrifo/components/SupplyOptions";
import SupplyModal from "@/features/tp/comercial/ControlGrifo/components/SupplyModal";
import { SupplyControlMobile } from "@/features/tp/comercial/ControlGrifo/components/SupplyControlMobile";
import { useDeviceType } from "@/shared/hooks/useDeviceType";
import SupplierModal from "@/features/tp/comercial/ControlGrifo/components/SupplierModal";
import SupplyTable from "@/features/tp/comercial/ControlGrifo/components/SupplyTable";

export default function SupplyControlPage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
    const { user } = useAuthStore();
    const { data: userComplete } = useUserComplete(user.id);
    const { isMobile } = useDeviceType();
    const [page, setPage] = useState(1);
    const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
    const [search, setSearch] = useState("");
    const [vehicleId, setVehicleId] = useState("");
    const [supplierId, setSupplierId] = useState("");
    const [isBase, setIsBase] = useState<string>("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
    const [modalMode, setModalMode] = useState<"create" | "update">("create");
    const [supplierModalOpen, setSupplierModalOpen] = useState(false);
    const [selectedSupplierId, setSelectedSupplierId] = useState<number | undefined>(undefined);
    const [supplierModalMode, setSupplierModalMode] = useState<"create" | "update">("create");
    const permissions = useModulePermissions("control-abastecimiento");
    const resetPage = useCallback(() => setPage(1), []);

    useEffect(() => {
        resetPage();
    }, [search, vehicleId, supplierId, isBase, dateFrom, dateTo, per_page, resetPage]);


    const { data, isLoading, refetch } = useSupplies({
        page,
        search,
        vehicle_id: vehicleId || undefined,
        supplier_id: supplierId || undefined,
        is_base: isBase !== "all" ? isBase === "1" : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        per_page,
    });

    const { data: suppliers, refetch: refetchSuppliers } = useActiveSuppliers();
    const { data: stats, refetch: refetchStats } = useSupplyStats();
    const deleteSupplyMutation = useDeleteSupply();
    //const deleteSupplierMutation = useDeleteSupplier();


    if (isLoadingModule) return <PageSkeleton />;
    if (!checkRouteExists("control-abastecimiento")) notFound();
    if (!currentView) notFound();

    const isDriver = userComplete?.position?.toUpperCase() === 'CONDUCTOR DE TRACTO CAMION' ||
        userComplete?.position?.toUpperCase() === 'INSTRUCTOR DE FLOTA';
    const isAssistant = userComplete?.position?.toUpperCase() === 'ASISTENTE DE OPERACIONES';



    // const handleDeleteSupplier = (id: number) => {
    //     if (window.confirm('¿Estás seguro de que deseas eliminar este grifo?')) {
    //         deleteSupplierMutation.mutate(id);
    //     }
    // };
    const handleCreate = () => {
        setSelectedId(undefined);
        setModalMode("create");
        setModalOpen(true);
    };

    const handleEdit = (id: number) => {
        setSelectedId(id);
        setModalMode("update");
        setModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('¿Estás seguro de que deseas anular este abastecimiento?')) {
            deleteSupplyMutation.mutate(id);
        }
    };

    const handleSupplierCreate = () => {
        setSelectedSupplierId(undefined);
        setSupplierModalMode("create");
        setSupplierModalOpen(true);
    };

    const handleRefresh = () => {
        refetch();
        refetchStats();
        refetchSuppliers();
    };

    // Columnas para la tabla desktop
    const columns = SupplyControlColumns({
        onEdit: permissions.canUpdate ? handleEdit : undefined,
        onDelete: permissions.canDelete ? handleDelete : undefined,
        permissions,
    });

    return (
        <div className="space-y-4">
            <HeaderTableWrapper>
                <TitleComponent
                    title={currentView.descripcion || "Control de Abastecimiento"}
                    subtitle={
                        isDriver
                            ? "Registrar mis abastecimientos"
                            : isAssistant
                                ? "Gestión de abastecimientos"
                                : "Control de abastecimientos"
                    }
                    icon={currentView.icon || "Fuel"}
                />
            </HeaderTableWrapper>

            {/* Estadísticas - Solo visible para asistentes o en desktop */}
            {!isDriver && stats && permissions.canExport && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <Fuel className="h-8 w-8 text-muted-foreground" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">En Base</p>
                                <p className="text-2xl font-bold text-green-600">{stats.in_base}</p>
                            </div>
                            <Badge className="bg-green-100 text-green-700">Base</Badge>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Fuera de Base</p>
                                <p className="text-2xl font-bold text-amber-600">{stats.out_of_base}</p>
                            </div>
                            <Badge className="bg-amber-100 text-amber-700">Fuera</Badge>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Galones</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {stats.total_gallons.toFixed(3)}
                                </p>
                            </div>
                            <span className="text-sm text-muted-foreground">gal</span>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Vista según rol */}
            {isDriver || isMobile ? (
                <>
                    {/* Opciones de filtro simplificadas para móvil */}
                    <div className="px-4">
                        <SupplyOptions
                            search={search}
                            setSearch={setSearch}
                            vehicleId={vehicleId}
                            setVehicleId={setVehicleId}
                            supplierId={supplierId}
                            setSupplierId={setSupplierId}
                            isBase={isBase}
                            setIsBase={setIsBase}
                            dateFrom={dateFrom}
                            setDateFrom={setDateFrom}
                            dateTo={dateTo}
                            setDateTo={setDateTo}
                            suppliers={suppliers || []}
                            vehicles={data?.data?.map(d => d.vehicle).filter(Boolean) as any[] || []}
                            permissions={permissions}
                        />
                    </div>

                    <SupplyControlMobile
                        data={data?.data || []}
                        isLoading={isLoading}
                        onRefresh={handleRefresh}
                        onAdd={handleCreate}
                        permissions={permissions}
                        isDriver={isDriver}
                    />
                </>
            ) : (
                <>
                    {/* Opciones de filtro y botones de acción */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <SupplyOptions
                            search={search}
                            setSearch={setSearch}
                            vehicleId={vehicleId}
                            setVehicleId={setVehicleId}
                            supplierId={supplierId}
                            setSupplierId={setSupplierId}
                            isBase={isBase}
                            setIsBase={setIsBase}
                            dateFrom={dateFrom}
                            setDateFrom={setDateFrom}
                            dateTo={dateTo}
                            setDateTo={setDateTo}
                            suppliers={suppliers || []}
                            vehicles={data?.data?.map(d => d.vehicle).filter(Boolean) as any[] || []}
                            permissions={permissions}
                        />

                        <div className="flex items-center gap-2">
                            {permissions.canCreate && (
                                <Button size="sm" onClick={handleCreate}>
                                    <Plus className="size-4 mr-2" />
                                    Nuevo Abastecimiento
                                </Button>
                            )}
                            {isAssistant && (
                                <Button size="sm" variant="outline" onClick={handleSupplierCreate}>
                                    <Plus className="size-4 mr-2" />
                                    Nuevo Grifo
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Tabla Desktop */}
                    <SupplyTable
                        columns={columns}
                        data={data?.data || []}
                        isLoading={isLoading}
                    />

                    {/* Paginación */}
                    <DataTablePagination
                        page={page}
                        totalPages={data?.meta?.last_page || 1}
                        onPageChange={setPage}
                        per_page={per_page}
                        setPerPage={setPerPage}
                        totalData={data?.meta?.total || 0}
                    />
                </>
            )}

            {/* Modal de Abastecimiento */}
            <SupplyModal
                id={selectedId}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalMode === "create" ? "Nuevo Abastecimiento" : "Editar Abastecimiento"}
                mode={modalMode}
                onSuccess={handleRefresh}
            />

            {/* Modal de Grifos - Solo para asistentes */}
            {isAssistant && (
                <SupplierModal
                    id={selectedSupplierId}
                    open={supplierModalOpen}
                    onClose={() => setSupplierModalOpen(false)}
                    title={supplierModalMode === "create" ? "Nuevo Grifo" : "Editar Grifo"}
                    mode={supplierModalMode}
                    onSuccess={() => {
                        refetchSuppliers();
                        handleRefresh();
                    }}
                />
            )}
        </div>
    );
}
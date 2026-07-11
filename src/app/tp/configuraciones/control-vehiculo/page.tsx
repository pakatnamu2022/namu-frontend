"use client";

import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { errorToast, successToast } from "@/core/core.function";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { notFound } from "@/shared/hooks/useNotFound";
import { useEffect, useState } from "react";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { VEHICULO } from "@/features/tp/configuraciones/vehiculo/ControlVehiculo/libs/vehiculo.constants";
import { useVehiculos } from "@/features/tp/configuraciones/vehiculo/ControlVehiculo/libs/vehiculo.hook";
import { deleteVehiculo } from "@/features/tp/configuraciones/vehiculo/ControlVehiculo/libs/vehiculo.actions";
import VehiculoActions from "@/features/tp/configuraciones/vehiculo/ControlVehiculo/components/VehiculoActions";
import VehiculoOptions from "@/features/tp/configuraciones/vehiculo/ControlVehiculo/components/VehiculoOptions";
import { vehiculoColumns } from "@/features/tp/configuraciones/vehiculo/ControlVehiculo/components/VehiculoColumns";
import VehiculoTable from "@/features/tp/configuraciones/vehiculo/ControlVehiculo/components/VehiculoTable";
import VehiculoModal from "@/features/tp/configuraciones/vehiculo/ControlVehiculo/components/VehiculoModal";

export default function ControlVehiculoPage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
    const [page, setPage] = useState(1);
    const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [vehiculoStatus, setVehiculoStatus] = useState("all");
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [updateId, setUpdateId] = useState<number | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { ROUTE } = VEHICULO;

    useEffect(() => {
        setPage(1);
    }, [search, per_page]);

    const { data, isLoading, refetch } = useVehiculos({
        page,
        per_page,
        search: search || undefined,
        status_deleted: status === "all" ? undefined : status,
        vehiculo_status: vehiculoStatus === "all" ? undefined : vehiculoStatus,
    });

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteVehiculo(deleteId);
            await refetch();
            successToast("Vehículo eliminado correctamente.");
        } catch (error) {
            errorToast("Error al eliminar el vehículo.");
        } finally {
            setDeleteId(null);
        }
    };

    const handleUpdate = (id: number) => {
        setUpdateId(id);
    };

    const handleCreate = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseUpdateModal = () => {
        setUpdateId(null);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    if (isLoadingModule) return <PageSkeleton />;
    if (!checkRouteExists(ROUTE)) notFound();
    if (!currentView) notFound();

    return (
        <div className="space-y-4">
            <HeaderTableWrapper>
                <TitleComponent
                    title={currentView.descripcion}
                    subtitle={currentView.descripcion}
                    icon={currentView.icon}
                />
                <VehiculoActions onCreate={handleCreate} />
            </HeaderTableWrapper>

            <VehiculoTable
                isLoading={isLoading}
                columns={vehiculoColumns({
                    onDelete: setDeleteId,
                    onUpdate: handleUpdate,
                })}
                data={data?.data || []}
            >
                <VehiculoOptions
                    search={search}
                    setSearch={setSearch}
                    status={status}
                    setStatus={setStatus}
                    vehiculoStatus={vehiculoStatus}
                    setVehiculoStatus={setVehiculoStatus}
                />
            </VehiculoTable>

            {/* Modal para crear */}
            <VehiculoModal
                open={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                title="Nuevo Vehículo"
                mode="create"
            />

            {/* Modal para editar */}
            {updateId && (
                <VehiculoModal
                    id={updateId}
                    open={!!updateId}
                    onClose={handleCloseUpdateModal}
                    title="Editar Vehículo"
                    mode="update"
                />
            )}

            {/* Diálogo de confirmación para eliminar */}
            {deleteId !== null && (
                <SimpleDeleteDialog
                    open={true}
                    onOpenChange={(open) => !open && setDeleteId(null)}
                    onConfirm={handleDelete}
                />
            )}

            {/* Paginación */}
            <DataTablePagination
                page={page}
                totalPages={data?.meta?.last_page || 1}
                onPageChange={setPage}
                per_page={per_page}
                setPerPage={setPerPage}
                totalData={data?.meta?.total || 0}
            />
        </div>
    );
}
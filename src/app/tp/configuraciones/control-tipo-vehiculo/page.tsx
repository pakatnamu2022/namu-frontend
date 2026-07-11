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
import { TIPOVEHICULO } from "@/features/tp/configuraciones/vehiculo/ControlTipoVehiculo/libs/tipoVehiculo.constants";
import { useTipoVehiculos } from "@/features/tp/configuraciones/vehiculo/ControlTipoVehiculo/libs/tipoVehiculo.hook";
import { deleteTipoVehiculo } from "@/features/tp/configuraciones/vehiculo/ControlTipoVehiculo/libs/tipoVehiculo.actions";
import TipoVehiculoActions from "@/features/tp/configuraciones/vehiculo/ControlTipoVehiculo/components/TipoVehiculoActions";
import TipoVehiculoTable from "@/features/tp/configuraciones/vehiculo/ControlTipoVehiculo/components/TipoVehiculoTable";
import { tipoVehiculoColumns } from "@/features/tp/configuraciones/vehiculo/ControlTipoVehiculo/components/TipoVehiculoColumns";
import TipoVehiculoOptions from "@/features/tp/configuraciones/vehiculo/ControlTipoVehiculo/components/TipoVehiculoOptions";
import TipoVehiculoModal from "@/features/tp/configuraciones/vehiculo/ControlTipoVehiculo/components/TipoVehiculoModal";

export default function ControlTipoVehiculoPage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
    const [page, setPage] = useState(1);
    const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [updateId, setUpdateId] = useState<number | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { ROUTE } = TIPOVEHICULO;

    useEffect(() => {
        setPage(1);
    }, [search, per_page]);

    const { data, isLoading, refetch } = useTipoVehiculos({
        page,
        per_page,
        search: search || undefined,
        status_deleted: status === "all" ? undefined : status,
    });

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteTipoVehiculo(deleteId);
            await refetch();
            successToast("Tipo de vehículo eliminado correctamente.");
        } catch (error) {
            errorToast("Error al eliminar el tipo de vehículo.");
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
                <TipoVehiculoActions onCreate={handleCreate} />
            </HeaderTableWrapper>

            <TipoVehiculoTable
                isLoading={isLoading}
                columns={tipoVehiculoColumns({
                    onDelete: setDeleteId,
                    onUpdate: handleUpdate,
                })}
                data={data?.data || []}
            >
                <TipoVehiculoOptions
                    search={search}
                    setSearch={setSearch}
                    status={status}
                    setStatus={setStatus}
                />
            </TipoVehiculoTable>

            {/* Modal para crear */}
            <TipoVehiculoModal
                open={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                title="Nuevo Tipo de Vehículo"
                mode="create"
            />

            {/* Modal para editar */}
            {updateId && (
                <TipoVehiculoModal
                    id={updateId}
                    open={!!updateId}
                    onClose={handleCloseUpdateModal}
                    title="Editar Tipo de Vehículo"
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
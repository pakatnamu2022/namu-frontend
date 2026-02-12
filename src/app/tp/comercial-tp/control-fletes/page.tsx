"use client";

import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { errorToast, successToast } from "@/core/core.function";
import FreightActions from "@/features/tp/comercial/ControlFletes/components/FreightActions";
import { freightColumns } from "@/features/tp/comercial/ControlFletes/components/FreightColumns";
import FreightOptions from "@/features/tp/comercial/ControlFletes/components/FreightOptions";
import FreightTable from "@/features/tp/comercial/ControlFletes/components/FreightTable";
import { deleteFreight } from "@/features/tp/comercial/ControlFletes/lib/freightControl.actions";
import { useFreightsControl } from "@/features/tp/comercial/ControlFletes/lib/freightControl.hook";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { notFound } from "@/shared/hooks/useNotFound";
import { useEffect, useState } from "react";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { FREIGHTCONTROL } from "@/features/tp/comercial/ControlFletes/lib/freightControl.constants";
import FreightModal from "@/features/tp/comercial/ControlFletes/components/FreightModal";

export default function ControlFreightPage(){
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
    const [page, setPage] = useState(1);
    const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [useStatus, setUseStatus] = useState("all");
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [updateId, setUpdateId] = useState<number | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { ROUTE } = FREIGHTCONTROL;

    useEffect(()=> {
        setPage(1);
    }, [search, per_page]);

    const { data, isLoading, refetch } = useFreightsControl({
        page,
        search,
        status_id: status === "all" ? undefined: status
    });

    const handleDelete = async () => {
        if(!deleteId) return;
        try{
            await deleteFreight(deleteId);
            await refetch();
            successToast("Flete eliminado correctamente. ");
        }catch(error){
            errorToast("Error al eliminar el flete. ");
        }finally{
            setDeleteId(null);
        }
    };

    const handleUpdate = (id: number) => {
        setUpdateId(id);
    }
    const handleCreate = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseUpdateModal = () => {
        setUpdateId(null);
    };
    
    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    if(isLoadingModule) return <PageSkeleton />;
    if(!checkRouteExists(ROUTE)) notFound();
    if(!currentView) notFound();    

    return(
        <div className="space-y-4">
            <HeaderTableWrapper>
                <TitleComponent
                   title={currentView.descripcion}
                   subtitle={currentView.descripcion}
                   icon={currentView.icon}
                />
                <FreightActions onCreate={handleCreate}/>
            </HeaderTableWrapper>
            <FreightTable
                isLoading={isLoading}
                columns={ freightColumns({
                    onDelete: setDeleteId, 
                    onUpdate: handleUpdate
                })}
                data={data?.data || []}
            >
                <FreightOptions
                    search={search}
                    setSearch={setSearch}
                    status={status}
                    setStatus={setStatus}
                    useStatus={useStatus}
                    setUseStatus={setUseStatus} 

                />

            </FreightTable>

            <FreightModal
                open={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                title="Nuevo Flete"
                mode="create"
            />
            {updateId && (
                <FreightModal
                    id={updateId}
                    open={!!updateId}
                    onClose={handleCloseUpdateModal}
                    title="Editar Flete"
                    mode="update"
                />
            )}

            {deleteId !== null && (
                <SimpleDeleteDialog
                    open={true}
                    onOpenChange={(open) => !open && setDeleteId(null)}
                    onConfirm={handleDelete}
                />
            )}

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
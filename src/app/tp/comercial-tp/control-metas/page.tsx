"use client";

import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { errorToast, successToast } from "@/core/core.function";
import GoalTravelActions from "@/features/tp/comercial/ControlMetas/components/GoalTravelActions";
import { goalTravelColumns } from "@/features/tp/comercial/ControlMetas/components/GoalTravelColumns";
import GoalTravelModal from "@/features/tp/comercial/ControlMetas/components/GoalTravelModal";
import GoalTravelOptions from "@/features/tp/comercial/ControlMetas/components/GoalTravelOptions";
import GoalTravelTable from "@/features/tp/comercial/ControlMetas/components/GoalTravelTable";
import { deleteGoalTravel } from "@/features/tp/comercial/ControlMetas/lib/GoalTravelControl.actions";
import { GOALTRAVELCONTROL } from "@/features/tp/comercial/ControlMetas/lib/GoalTravelControl.constants";
import { useGoalTravelControl } from "@/features/tp/comercial/ControlMetas/lib/GoalTravelControl.hook";
import DataTablePagination from "@/shared/components/DataTablePagination";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import TitleComponent from "@/shared/components/TitleComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { notFound } from "@/shared/hooks/useNotFound";
import { useEffect, useState } from "react";



export default function ControlGoalPage(){
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
    const [page, setPage] = useState(1);
    const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [useStatus, setUseStatus] = useState("all");
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [updateId, setUpdateId] = useState<number | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { ROUTE } = GOALTRAVELCONTROL;

     useEffect(()=> {
            setPage(1);
    }, [search, per_page]);

    const { data, isLoading, refetch } = useGoalTravelControl({
        page,
        search,
        status_id: status === "all" ? undefined: status
    });

    const handleDelete = async () => {
        if(!deleteId) return;

        try{
            await deleteGoalTravel(deleteId);
            await refetch();
            successToast("Meta eliminada correctamente. ");

        }catch(error){
            errorToast("Error al eliminar la meta. ");
        }finally{
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
                <GoalTravelActions onCreate={handleCreate} />
            </HeaderTableWrapper>
            <GoalTravelTable
                isLoading={isLoading}
                columns={ goalTravelColumns({
                   onDelete: setDeleteId,
                   onUpdate: handleUpdate 
                })}
                data = {data?.data || []}
            >
                <GoalTravelOptions
                    search={search}
                    setSearch={setSearch}
                    status={status}
                    setStatus={setStatus}
                    useStatus={useStatus}
                    setUseStatus={setUseStatus} 
                />
            </GoalTravelTable>

            <GoalTravelModal
                open={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                title="Nueva Meta"
                mode="create"
            />
            {updateId && (
                <GoalTravelModal
                    id={updateId}
                    open={!!updateId}
                    onClose={handleCloseUpdateModal}
                    title="Editar Meta"
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
    )



    

}
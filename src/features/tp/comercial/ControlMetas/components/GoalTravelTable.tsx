import { DataTable } from "@/shared/components/DataTable";
import { GoalTravelControlResource } from "../lib/GoalTravelControl.interface";
import { GoalTravelColumns } from "./GoalTravelColumns";


interface Props {
    columns: GoalTravelColumns[];
    data: GoalTravelControlResource[];
    children?: React.ReactNode;
    isLoading?: boolean;
}

export default function GoalTravelTable({
    columns,
    data,
    children,
    isLoading,
}: Props) {
    return (
        <div className="border-none text-muted-foreground max-w-full">
            <DataTable
                columns={columns}
                data={data}
                isLoading={isLoading}
            >
                {children}
            </DataTable>
        </div>
    )
}
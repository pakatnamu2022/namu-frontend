import { type Links, type Meta } from '@/shared/lib/pagination.interface';


export interface GoalTravelControlResponse {
    data: GoalTravelControlResource[];
    links: Links;
    meta: Meta;
}

export interface GoalTravelControlResource{
    id: number;
    date: Date;
    total: number;
    driver_goal: number;
    vehicle_goal: number;
    total_units: number;
    status_deleted: number;
}

export interface getGoalTravelControlProps{
    params?: Record<string, any>;
}
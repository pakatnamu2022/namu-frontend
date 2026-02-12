import { api } from "@/core/api";
import { GOALTRAVELCONTROL } from "./GoalTravelControl.constants";
import {
  GoalTravelControlResource,
  GoalTravelControlResponse,
  getGoalTravelControlProps,
} from "./GoalTravelControl.interface";
import { AxiosRequestConfig } from "axios";
import { GeneralResponse } from "@/shared/lib/response.interface";

const { ENDPOINT } = GOALTRAVELCONTROL;

export async function getGoalTravel({
  params,
}: getGoalTravelControlProps): Promise<GoalTravelControlResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  try {
    const response = await api.get<GoalTravelControlResponse>(ENDPOINT, config);

    if (response.data && (response.data as any).original) {
      const apiResponse = response.data as any;
      return apiResponse.original;
    }
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        `Server Error: ${error.response.data.message || "Unknown error"}`,
      );
    } else if (error.request) {
      throw new Error("Network Error: No response from server");
    } else {
      throw new Error(`Request Error: ${error.message}`);
    }
  }
}

export async function deleteGoalTravel(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function findGoalTravelById(
  id: number,
): Promise<GoalTravelControlResource> {
  const response = await api.get<GoalTravelControlResource>(
    `${ENDPOINT}/${id}`,
  );
  return response.data;
}

export async function storeGoalTravel(
  data: any,
): Promise<GoalTravelControlResponse> {
  const response = await api.post<GoalTravelControlResponse>(
    `${ENDPOINT}`,
    data,
  );
  return response.data;
}

export async function updateGoalTravel(
  id: number,
  data: any,
): Promise<GoalTravelControlResponse> {
  const response = await api.put<GoalTravelControlResponse>(
    `${ENDPOINT}/${id}`,
    data,
  );
  return response.data;
}

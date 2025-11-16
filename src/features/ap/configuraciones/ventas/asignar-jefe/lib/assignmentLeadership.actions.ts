import { AxiosRequestConfig } from "axios";
import { ASSIGNMENT_LEADERSHIP } from "./assignmentLeadership.constants";
import {
  AssignmentLeadershipResource,
  AssignmentLeadershipResponse,
  getAssignmentLeadershipProps,
} from "./assignmentLeadership.interface";
import { api } from "@/core/api";

const { ENDPOINT } = ASSIGNMENT_LEADERSHIP;

export async function getAssignmentLeadership({
  params,
}: getAssignmentLeadershipProps): Promise<AssignmentLeadershipResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<AssignmentLeadershipResponse>(
    ENDPOINT,
    config
  );
  return data;
}

export async function findAssignmentLeadershipById(
  id: number
): Promise<AssignmentLeadershipResource> {
  const response = await api.get<AssignmentLeadershipResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storeAssignmentLeadership(
  data: any
): Promise<AssignmentLeadershipResource> {
  const response = await api.post<AssignmentLeadershipResource>(ENDPOINT, data);
  return response.data;
}

export async function updateAssignmentLeadership(
  id: number,
  data: any
): Promise<AssignmentLeadershipResource> {
  const response = await api.put<AssignmentLeadershipResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

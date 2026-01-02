import { api } from "@/core/api";
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
} from "./change-password.interface";

export const changePassword = async (
  data: ChangePasswordRequest
): Promise<ChangePasswordResponse> => {
  const response = await api.post<ChangePasswordResponse>(
    `change-password`,
    data
  );
  return response.data;
};

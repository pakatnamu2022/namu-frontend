import { api } from "@/core/api";
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
} from "./change-password.interface";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost/milla-backend/public/api";

export const changePassword = async (
  data: ChangePasswordRequest
): Promise<ChangePasswordResponse> => {
  const response = await api.post<ChangePasswordResponse>(
    `${BASE_URL}/change-password`,
    data
  );
  return response.data;
};

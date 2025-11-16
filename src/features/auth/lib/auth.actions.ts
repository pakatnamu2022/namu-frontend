import { api } from "@/core/api";
import {
  AuthRequest,
  AuthResponse,
  AuthResponseWithoutToken,
} from "./auth.interface";

export async function login({
  username,
  password,
}: AuthRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("login", {
    username: username,
    password: password,
  });
  return data;
}

export const authenticate = async (): Promise<AuthResponseWithoutToken> => {
  const { data } = await api.get<AuthResponseWithoutToken>("/authenticate");
  return data;
};

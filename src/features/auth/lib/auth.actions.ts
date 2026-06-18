import { api } from "@/core/api";
import type {
  AuthRequest,
  AuthResponseWithoutToken,
  LoginResponse,
} from "./auth.interface";

export async function login({
  username,
  password,
}: AuthRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("login", {
    username: username,
    password: password,
  });
  return data;
}

export const authenticate = async (): Promise<AuthResponseWithoutToken> => {
  const { data } = await api.get<AuthResponseWithoutToken>("/authenticate");
  return data;
};

export const logout = async (): Promise<void> => {
  await api.post("/logout");
};
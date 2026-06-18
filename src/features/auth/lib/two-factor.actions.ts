import { api } from "@/core/api";
import type {
  TwoFactorDisableRequest,
  TwoFactorEnableRequest,
  TwoFactorMessageResponse,
  TwoFactorSetupResponse,
  TwoFactorVerifyRequest,
} from "./two-factor.interface";
import type { AuthResponse } from "./auth.interface";

export const setup2FA = async (): Promise<TwoFactorSetupResponse> => {
  const { data } = await api.post<TwoFactorSetupResponse>("auth/2fa/setup");
  return data;
};

export const enable2FA = async (
  request: TwoFactorEnableRequest,
): Promise<TwoFactorMessageResponse> => {
  const { data } = await api.post<TwoFactorMessageResponse>(
    "auth/2fa/enable",
    request,
  );
  return data;
};

export const disable2FA = async (
  request: TwoFactorDisableRequest,
): Promise<TwoFactorMessageResponse> => {
  const { data } = await api.post<TwoFactorMessageResponse>(
    "auth/2fa/disable",
    request,
  );
  return data;
};

export const verify2FA = async (
  request: TwoFactorVerifyRequest,
): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("auth/2fa/verify", request);
  return data;
};

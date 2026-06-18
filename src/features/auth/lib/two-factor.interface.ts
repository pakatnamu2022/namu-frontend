export interface TwoFactorSetupResponse {
  secret: string;
  qr_url: string;
}

export interface TwoFactorEnableRequest {
  secret: string;
  code: string;
}

export interface TwoFactorDisableRequest {
  code: string;
}

export interface TwoFactorVerifyRequest {
  pending_token: string;
  code: string;
}

export interface TwoFactorMessageResponse {
  message: string;
}

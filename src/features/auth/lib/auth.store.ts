import { create } from "zustand";
import type { AuthRequest, ModulePermissions } from "./auth.interface";
import { authenticate, login, logout } from "./auth.actions";
import { verify2FA } from "./two-factor.actions";
import type { TwoFactorVerifyRequest } from "./two-factor.interface";
import type { ViewsResponseOpcionesMenu } from "../../views/lib/views.interface";
import { UserResource } from "@/features/gp/gestionsistema/usuarios/lib/user.interface";

const getInitialToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token") || undefined;
  }
  return undefined;
};

interface AuthState {
  token?: string;
  isAuthenticated: boolean;
  user: UserResource;
  isHydrated: boolean;
  permissions?: ViewsResponseOpcionesMenu[];
  permissionsModules?: ModulePermissions;
  general?: { freight_commission: number };
  setToken?: (token: string) => void;
  login: (request: AuthRequest) => Promise<void>;
  verifyWith2FA: (request: TwoFactorVerifyRequest) => Promise<void>;
  setUserTwoFactor: (enabled: boolean) => void;
  logout: () => Promise<void>;
  authenticate: () => void;
  hasPermission: (permissionCode: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: "",
  isAuthenticated: !!getInitialToken(),
  user: {} as UserResource,
  permissions: [],
  permissionsModules: [],
  general: undefined,
  isHydrated: false,
  hasPermission: (permissionCode: string) => {
    const { permissionsModules } = get();

    // Support both array and object formats
    if (Array.isArray(permissionsModules)) {
      return permissionsModules.includes(permissionCode);
    }

    return permissionsModules?.[permissionCode] === true;
  },
  login: async (request) => {
    const response = await login(request);
    if ("requires_2fa" in response && response.requires_2fa) {
      throw { requires_2fa: true, pending_token: response.pending_token };
    }
    const authResponse = response as import("./auth.interface").AuthResponse;
    if (authResponse) {
      if (typeof window !== "undefined") {
        localStorage.setItem("token", authResponse.access_token);
        localStorage.setItem("user", JSON.stringify(authResponse.user));
        localStorage.setItem(
          "permissions",
          JSON.stringify(authResponse.permissions),
        );
        localStorage.setItem("general", JSON.stringify(authResponse.general));
      }
      set({
        isAuthenticated: true,
        user: authResponse.user,
        token: authResponse.access_token,
        permissions: authResponse.permissions?.access_tree || [],
        permissionsModules: authResponse.permissions?.permissions_modules || {},
        general: authResponse.general,
      });
    } else {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("permissions");
      }
      set({
        isAuthenticated: false,
        user: undefined,
        token: undefined,
        isHydrated: true,
        permissions: [],
        permissionsModules: [],
      });
    }
  },
  verifyWith2FA: async (request) => {
    const response = await verify2FA(request);
    if (typeof window !== "undefined") {
      localStorage.setItem("token", response.access_token);
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("permissions", JSON.stringify(response.permissions));
      localStorage.setItem("general", JSON.stringify(response.general));
    }
    set({
      isAuthenticated: true,
      user: response.user,
      token: response.access_token,
      permissions: response.permissions?.access_tree || [],
      permissionsModules: response.permissions?.permissions_modules || {},
      general: response.general,
    });
  },
  setUserTwoFactor: (enabled) => {
    set((state) => ({
      user: { ...state.user, two_factor_enabled: enabled },
    }));
  },
  logout: async () => {
    // Call API logout FIRST with active token
    await logout();

    // Then remove token and clear state
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("permissions");
      localStorage.removeItem("general");
    }

    set({
      user: undefined,
      token: undefined,
      isHydrated: true,
      permissions: [],
      permissionsModules: {},
      general: undefined,
    });
  },
  authenticate: async () => {
    // Check if token exists before making API call
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      // No token, clear auth state
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("permissions");
      }
      set({
        user: undefined,
        token: undefined,
        isAuthenticated: false,
        isHydrated: true,
        permissions: [],
        permissionsModules: {},
      });
      return;
    }

    // Token exists, proceed with authentication
    const { user, permissions, general } = await authenticate();
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("general", JSON.stringify(general));
      set({
        user,
        permissions: permissions?.access_tree || [],
        permissionsModules: permissions?.permissions_modules || {},
        general,
        isAuthenticated: true,
      });
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("permissions");
      set({
        user: undefined,
        token: undefined,
        isAuthenticated: false,
        isHydrated: true,
        permissions: [],
        permissionsModules: {},
      });
    }
  },
}));

import { create } from "zustand";
import type { AuthRequest, ModulePermissions } from "./auth.interface";
import { authenticate, login, logout } from "./auth.actions";
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
  permissions?: ViewsResponseOpcionesMenu[]; // Access tree for navigation
  permissionsModules?: ModulePermissions; // Module permissions { "module.action": true }
  setToken?: (token: string) => void;
  login: (request: AuthRequest) => Promise<void>;
  logout: () => Promise<void>;
  authenticate: () => void;
  hasPermission: (permissionCode: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: "",
  isAuthenticated: !!getInitialToken(),
  user: {} as UserResource,
  permissions: [],
  permissionsModules: [], // Initialize as empty array (backend sends array)
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
    if (response) {
      if (typeof window !== "undefined") {
        localStorage.setItem("token", response.access_token);
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem(
          "permissions",
          JSON.stringify(response.permissions)
        );
      }
      set({
        isAuthenticated: true,
        user: response.user,
        token: response.access_token,
        permissions: response.permissions?.access_tree || [],
        permissionsModules: response.permissions?.permissions_modules || {},
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
  logout: async () => {
    // Call API logout FIRST with active token
    try {
      await logout();
    } catch (error) {
      // If logout fails (401, network, etc.), still proceed with local cleanup
      console.log("Logout API call failed:", error);
    }

    // Then remove token and clear state
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("permissions");
    }

    set({
      user: undefined,
      token: undefined,
      isHydrated: true,
      permissions: [],
      permissionsModules: {},
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
    const { user, permissions } = await authenticate();
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      set({
        user,
        permissions: permissions?.access_tree || [],
        permissionsModules: permissions?.permissions_modules || {},
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

"use client";

import { useAuthStore } from "@/features/auth/lib/auth.store";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password"];

export const AuthInitializer = () => {
  const { authenticate } = useAuthStore();
  const { pathname } = useLocation();

  useEffect(() => {
    const isPublic = PUBLIC_ROUTES.includes(pathname);

    if (isPublic) return;

    authenticate();
  }, [pathname]);

  return null;
};

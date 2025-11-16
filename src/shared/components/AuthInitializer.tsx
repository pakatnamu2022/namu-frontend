"use client";

import { useAuthStore } from "@/src/features/auth/lib/auth.store";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password"];

export const AuthInitializer = () => {
  const { authenticate } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    const isPublic = PUBLIC_ROUTES.includes(pathname);

    if (isPublic) return;

    authenticate();
  }, [pathname]);

  return null;
};

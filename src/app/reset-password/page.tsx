"use client";

import { ResetPassword } from "@/features/auth/components/ResetPassword";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/companies", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="bg-linear-to-br from-slate-50 to-blue-50/30 dark:from-background/10 dark:to-background/50 flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <ResetPassword />
      </div>
    </div>
  );
}

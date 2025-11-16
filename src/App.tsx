"use client";

import { Login } from "./features/auth/components/Login";

export default function LoginPage() {
  return (
    <div className="bg-linear-to-br from-slate-50 to-blue-50/30 flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      {/* <div className="bg-linear-to-tr backdrop-blur-3xl from-primary/40 to-secondary/40 flex min-h-svh flex-col items-center justify-center p-6 md:p-10"> */}
      <div className="w-full max-w-sm md:max-w-4xl">
        <Login />
      </div>
    </div>
  );
}

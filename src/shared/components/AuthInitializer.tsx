"use client";

import { useAuthStore } from "@/features/auth/lib/auth.store";
import { ChangePasswordModal } from "@/features/auth/components/ChangePasswordModal";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const PUBLIC_ROUTES = ["/", "/login"];

export const AuthInitializer = () => {
  const { authenticate, user, isAuthenticated } = useAuthStore();
  const { pathname } = useLocation();
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  useEffect(() => {
    const isPublic = PUBLIC_ROUTES.includes(pathname);

    if (isPublic) return;

    authenticate();
  }, [pathname]);

  // Check if user needs to change password
  useEffect(() => {
    if (isAuthenticated && user && user.verified_at === null) {
      setShowChangePasswordModal(true);
    } else {
      setShowChangePasswordModal(false);
    }
  }, [isAuthenticated, user]);

  return (
    <>
      {showChangePasswordModal && (
        <ChangePasswordModal
          open={showChangePasswordModal}
          onClose={() => {
            // No permitir cerrar el modal si verified_at es null
            if (user?.verified_at !== null) {
              setShowChangePasswordModal(false);
            }
          }}
          isForced={true}
          defaultCurrentPassword={user?.username || ""}
        />
      )}
    </>
  );
};

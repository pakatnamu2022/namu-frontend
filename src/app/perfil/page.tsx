"use client";

import { useAuthStore } from "@/features/auth/lib/auth.store";
import { useUserComplete } from "@/features/gp/gestionsistema/usuarios/lib/user.hook";
import PageWrapper from "@/shared/components/PageWrapper";
import ProfileView from "@/shared/components/ProfileView";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { data: userComplete } = useUserComplete(user.id);

  if (!userComplete) return null;

  return (
    <PageWrapper>
      <ProfileView data={userComplete} showSecurity />
    </PageWrapper>
  );
}

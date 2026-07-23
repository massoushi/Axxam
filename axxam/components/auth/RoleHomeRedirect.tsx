"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { dashboardPathForRole } from "@/lib/auth-storage";

/**
 * Sur l'accueil `/`, redirige propriétaire / agence / admin vers leur espace.
 * Les voyageurs et visiteurs restent sur la marketplace.
 */
export default function RoleHomeRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    if (user.role === "owner" || user.role === "agency" || user.role === "admin") {
      router.replace(dashboardPathForRole(user.role));
    }
  }, [user, loading, router]);

  return null;
}

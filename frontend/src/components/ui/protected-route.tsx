"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useAuthStore } from "@/store/auth-store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, hydrated, loading } = useAuthStore();

  useEffect(() => {
    if (!hydrated || loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    if (requireAdmin && user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [hydrated, loading, requireAdmin, router, user]);

  if (!hydrated || loading || !user || (requireAdmin && user.role !== "ADMIN")) {
    return (
      <div className="mx-auto mt-8 max-w-xl">
        <LoadingSkeleton />
      </div>
    );
  }

  return <>{children}</>;
}

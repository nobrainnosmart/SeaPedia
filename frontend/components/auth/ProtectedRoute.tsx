"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser, isLoggedIn } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: string;
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/auth/login");
      return;
    }

    const user = getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Role check
    if (allowedRole && user.activeRole !== allowedRole) {
      if (user.activeRole) {
        router.push(`/${user.activeRole.toLowerCase()}/dashboard`);
      } else {
        router.push("/auth/select-role");
      }
      return;
    }

    setAuthorized(true);
  }, [router, allowedRole]);

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-zinc-500 animate-pulse">Checking credentials...</p>
      </div>
    );
  }

  return <>{children}</>;
}

"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { fetchApi } from "../../lib/api";

export default function AuthCompletePage() {
  const { isLoaded: authLoaded, isSignedIn, getToken } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const router = useRouter();
  const hasSynced = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoaded || !userLoaded || hasSynced.current) {
      return;
    }

    if (!isSignedIn || !user) {
      router.replace("/login");
      return;
    }

    const syncUser = async () => {
      const clerkToken = await getToken();

      if (!clerkToken) {
        setError("Could not obtain Clerk session token.");
        return;
      }

      hasSynced.current = true;

      const response = await fetchApi("/api/auth/clerk-sync", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${clerkToken}`,
        },
      });

      if (!response.ok) {
        hasSynced.current = false;
        setError("Could not synchronize your account.");
        return;
      }

      router.replace("/dashboard");
    };

    syncUser().catch(() => {
      hasSynced.current = false;
      setError("Could not synchronize your account.");
    });
  }, [
    authLoaded,
    userLoaded,
    isSignedIn,
    user,
    getToken,
    router,
  ]);

  if (error) {
    return <main className="p-8 text-red-500">{error}</main>;
  }

  return <main className="p-8 text-white">Signing you in...</main>;
}

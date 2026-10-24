"use client";

import { useClerk } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "../lib/api";

export default function LogoutPage() {
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      await fetchApi("/api/auth/logout", {
        method: "POST",
      });

      await signOut();
      router.replace("/");
    };

    logout();
  }, [signOut, router]);

  return <main className="p-8 text-white">Logging out...</main>;
}

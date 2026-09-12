"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "../lib/api";

const page = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  //when router is loaded then the logout request can be made to remove cookies
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchApi("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.message || "Logout failed");
        }
        router.replace("/");
      } catch (e: any) {
        setError(e.message || "Logout failed");
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading && !error) return <div className="p-6">Logging out...</div>;
  return <div className="p-6 text-red-500">{error ?? "Redirecting..."}</div>;
}
export default page;

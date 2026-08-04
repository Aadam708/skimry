"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface PlanActionButtonProps {
  planName: string;
  ctaText: string;
  isFeatured: boolean;
}

export default function PlanActionButton({
  planName,
  ctaText,
  isFeatured,
}: PlanActionButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCTA() {
    setLoading(true);

    try {
      // Check session status via HttpOnly cookie
      const res = await fetch("http://localhost:8080/api/users/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const isLoggedIn = res.ok;

      if (planName.toLowerCase() === "free") {
        if (isLoggedIn) {
          router.push("/dashboard");
        } else {
          router.push("/login");
        }
      } else {
        // Pro Plan Flow
        if (isLoggedIn) {
          router.push("/pay");
        } else {
          router.push("/login?redirect=/pay");
        }
      }
    } catch (err) {
      // Fallback on network/fetch failure
      if (planName.toLowerCase() === "free") {
        router.push("/login");
      } else {
        router.push("/login?redirect=/pay");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      disabled={loading}
      onClick={handleCTA}
      className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
        isFeatured
          ? "bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-600/20"
          : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {loading ? "Checking session..." : ctaText}
    </button>
  );
}

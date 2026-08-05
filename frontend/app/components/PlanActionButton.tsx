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
      const meRes = await fetch("http://localhost:8080/api/users/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!meRes.ok) {
        router.push("/login?redirect=/pricing");
        return;
      }

      if (planName.toLowerCase() === "pro") {
        const res = await fetch("http://localhost:8080/api/payments/create-checkout-session", {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Stripe session request failed");
        }

        const data = await res.json();
        window.location.href = data.url;
        return;
      }

      if (planName.toLowerCase() === "free") {
        router.push("/dashboard");
        return;
      }
    } catch {
      router.push("/login?redirect=/pricing");
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

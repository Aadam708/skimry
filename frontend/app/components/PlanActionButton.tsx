"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface PlanActionButtonProps {
  planName: string;
  ctaText: string;
  isFeatured: boolean;
  currentTier: string | null;
}

export default function PlanActionButton({
  planName,
  ctaText,
  isFeatured,
  currentTier,
}: PlanActionButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const normalizedPlanName = planName.toLowerCase();
  const normalizedCurrentTier = currentTier?.toLowerCase() ?? null;

  async function handleCTA() {
    setLoading(true);

    try {
      if (!normalizedCurrentTier) {
        router.push("/login?redirect=/pricing");
        return;
      }

      // 1. Upgrade Path: User is on Free/other tier and wants Pro
      if (normalizedPlanName === "pro" && normalizedCurrentTier !== "pro") {
        const res = await fetch("http://localhost:8080/api/payments/create-checkout-session", {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Stripe checkout session request failed");
        }

        const data = await res.json();
        window.location.href = data.url;
        return;
      }

      // 2. Manage Path: User is ALREADY Pro and wants to manage/cancel subscription
      if (normalizedPlanName === "pro" && normalizedCurrentTier === "pro") {
        const res = await fetch("http://localhost:8080/api/payments/create-portal-session", {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Stripe portal session request failed");
        }

        const data = await res.json();
        window.location.href = data.url;
        return;
      }

      // 3. Free Plan Path
      if (normalizedPlanName === "free") {
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
      {loading ? "Redirecting..." : ctaText}
    </button>
  );
}

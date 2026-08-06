"use client";

import React, { useEffect, useState } from "react";
import ConditionalNavbar from "../components/ConditionalNavbar";
import PlanActionButton from "../components/PlanActionButton";

const pricingPlans = [
  {
    name: "Free",
    price: "£0",
    cadence: "/mo",
    badge: "Free forever",
    description: "For quick reads and casual articles.",
    features: [
      "3 summaries per month",
      "Basic Chrome extension extraction",
      "Saved materials dashboard",
      "Manual refresh of saved content",
    ],
    cta: "Get started",
    featured: false,
  },
  {
    name: "Pro",
    price: "£4.99",
    cadence: "/mo",
    badge: "Best value",
    description: "For power users who want more volume, better flow, and a smoother workflow.",
    features: [
      "110 summaries per month",
      "Expanded article limits",
      "Seamless high-volume research",
      "Zero commitment, cancel anytime",
    ],
    cta: "Upgrade to Pro",
    featured: true,
  },
];

export default function PricingPage() {
  const [currentTier, setCurrentTier] = useState<string | null>(null);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/users/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          setCurrentTier(null);
          return;
        }

        const data = await res.json();

        if(typeof data?.tier === "string"){
          setCurrentTier(data.tier);

          if(currentTier?.toLowerCase() === "pro") {

          }

        }

      } catch {
        setCurrentTier(null);
      }
    };

    loadCurrentUser();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-pink-500/30 selection:text-pink-200">
      <ConditionalNavbar />

      <div className="relative mx-auto max-w-[1600px] px-6 py-24 sm:px-10 sm:py-28 lg:py-32">
        <div className="absolute top-0 left-1/4 -z-10 h-72 w-72 rounded-full bg-pink-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 -z-10 h-96 w-96 rounded-full bg-purple-600/10 blur-[150px] pointer-events-none" />

        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-400">
            Pricing
          </p>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl bg-linear-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Pick the plan that fits your reading flow
          </h1>
          <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed">
            Same clean interface. No artificial reading limits.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl border p-8 backdrop-blur-md shadow-2xl transition-all duration-300 ${
                plan.featured
                  ? "border-pink-500/40 bg-zinc-900/70 shadow-pink-500/10"
                  : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p
                    className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      plan.featured
                        ? "bg-pink-500/10 text-pink-300 border border-pink-500/20"
                        : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                    }`}
                  >
                    {plan.badge}
                  </p>
                  <h2 className="mt-4 text-2xl font-bold text-zinc-100">
                    {plan.name}
                  </h2>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {plan.featured && (
                  <div className="h-14 w-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                    <span className="text-pink-400 text-2xl font-bold">★</span>
                  </div>
                )}
              </div>

              <div className="mt-8 flex items-end gap-2">
                <span className="text-5xl font-extrabold tracking-tight text-zinc-100">
                  {plan.price}
                </span>
                <span className="pb-2 text-sm font-medium text-zinc-400">
                  {plan.cadence}
                </span>
              </div>

              <div className="mt-8 border-t border-zinc-800 pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  What&apos;s included
                </p>
                <ul className="mt-4 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-zinc-300">
                      <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 text-[10px] font-bold">
                        ✓
                      </span>
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                {/* Embedded Client Component */}
                <PlanActionButton
                  planName={plan.name}
                  ctaText={
                    plan.name.toLowerCase() === "pro" && currentTier?.toLowerCase() === "pro"
                      ? "Cancel subscription"
                      : plan.cta
                  }
                  isFeatured={plan.featured}
                  currentTier={currentTier}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

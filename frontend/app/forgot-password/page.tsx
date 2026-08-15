"use client";

import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import NavbarComponent from "../components/NavbarComponent";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error" | "processing"; text: string } | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ type: "processing", text: "Sending reset code..." });

    try {
      const res = await fetch("http://localhost:8080/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await res.text().catch(() => null);

      if (res.ok) {
        setStatus({ type: "success", text: data || "If an account exists an email has been sent." });
        // navigate to reset page and pass email in query
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 800);
      } else {
        setStatus({ type: "error", text: data || `Request failed (${res.status})` });
      }
    } catch (err: any) {
      setStatus({ type: "error", text: err?.message || "Network error" });
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-black font-sans">
      <NavbarComponent />

      <main className="flex flex-col flex-1 items-center justify-center px-4 pt-24 pb-10">
        <section className="flex flex-col w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/70 gap-6 p-8 shadow-[0_0_40px_rgba(236,72,153,0.12)] backdrop-blur-sm">
          <div className="flex flex-col gap-1.5 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white">Forgot Password</h1>
            <p className="max-w-sm text-sm text-zinc-400">Enter your email to receive a reset code.</p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-zinc-200">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900/70 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-linear-to-r from-pink-500 to-red-500 px-4 py-3 font-semibold text-white"
            >
              Send
            </button>
          </form>

          {status && (
            <div
              className={`mt-2 text-sm px-3 py-2 rounded ${status.type === "processing" ? "bg-gray-700 text-white" : status.type === "success" ? "bg-emerald-600 text-white" : "bg-red-500 text-white"}`}
            >
              {status.text}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

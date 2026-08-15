"use client";

import { useState, type ChangeEvent, type SubmitEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NavbarComponent from "../components/NavbarComponent";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams?.get("email") ?? "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error" | "processing"; text: string } | null>(null);

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!otp.trim()) {
      setStatus({ type: "error", text: "Please enter the OTP." });
      return;
    }
    if (newPassword.length < 6) {
      setStatus({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", text: "Passwords do not match." });
      return;
    }

    setStatus({ type: "processing", text: "Resetting password..." });

    try {
      const res = await fetch("http://localhost:8080/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          otp,
          newPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        setStatus({ type: "success", text: data?.message || "Password reset successfully." });
        setTimeout(() => router.push("/login"), 900);
      } else {
        const msg = data?.message || data?.error || `Request failed (${res.status})`;
        setStatus({ type: "error", text: msg });
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
            <h1 className="text-2xl font-bold tracking-tight text-white">Reset Password</h1>
            <p className="max-w-sm text-sm text-zinc-400">Enter the code you received and choose a new password.</p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-200">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900/70 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-200">OTP</label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setOtp(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900/70 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-200">New password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900/70 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-200">Confirm password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900/70 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30"
              />
            </div>

            <button type="submit" className="rounded-xl bg-linear-to-r from-pink-500 to-red-500 px-4 py-3 font-semibold text-white">
              Reset password
            </button>
          </form>

          {status && (
            <div className={`mt-2 text-sm px-3 py-2 rounded ${status.type === "processing" ? "bg-gray-700 text-white" : status.type === "success" ? "bg-emerald-600 text-white" : "bg-red-500 text-white"}`}>
              {status.text}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

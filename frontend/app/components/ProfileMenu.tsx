"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "../lib/api";
import {useRouter} from "next/navigation"
type DeleteOption = 10 | 50 | 100 | "all";

export default function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [deleting, setDeleting] = useState<DeleteOption | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const deleteMaterials = async (option: DeleteOption) => {
    const label =
      option === "all" ? "all materials" : `the oldest ${option} materials`;

    if (!window.confirm(`Delete ${label}? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(option);
      setMessage(null);

      // Placeholder endpoint until the backend is implemented.
      const response = await fetchApi("/api/materials/delete", {
        method: "DELETE",
        body: JSON.stringify({
          type: option === "all" ? "all" : "oldest",
          amount: option === "all" ? null : option,
        }),
      });

      if (!response.ok) {
        throw new Error("Material deletion failed.");
      }

      setMessage(
        option === "all"
          ? "All materials were deleted."
          : `The oldest ${option} materials were deleted.`,
      );
    } catch (error) {
      console.error("Material deletion failed:", error);
      setMessage("Unable to delete materials. Please try again later.");
    } finally {
      setDeleting(null);
    }
  };

  const deleteAccount = async () => {
    if (
      !window.confirm(
        `Permanently delete your account?
         Any subscriptions will be cancelled and all your skims will be lost.
         This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      setMessage("Deleting your account...");

      const response = await fetchApi("/api/account", {
        method: "DELETE",
      });

      const responseBody = await response.json().catch(() => null);

      if (!response.ok) {
        console.error("Account deletion response:", {
          status: response.status,
          body: responseBody,
        });

        throw new Error(
          responseBody?.error ||
            `Account deletion failed with status ${response.status}`,
        );
      }

      window.alert(
        "Your account has been successfully deleted. You will now be returned home.",
      );

      setIsOpen(false);
      router.replace("/");
    } catch (error) {
      console.error("Account deletion failed:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete your account. Please try again later.",
      );
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Open profile menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/80 text-zinc-300  hover:cursor-pointer transition-colors duration-500 hover:border-pink-500 hover:bg-zinc-800 hover:text-pink-400"
      >
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-70">
          <button
            type="button"
            aria-label="Close profile menu"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 h-full w-full bg-black/70 backdrop-blur-[2px]"
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Profile menu"
            className="relative flex h-full w-[min(22rem,88vw)] flex-col overflow-y-auto border-r border-zinc-800 bg-zinc-950 px-6 py-6 text-zinc-100 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-400">
                  Profile
                </p>
                <h2 className="mt-1 text-xl font-bold">Account settings</h2>
              </div>

              <button
                type="button"
                aria-label="Close profile menu"
                onClick={() => setIsOpen(false)}
                className="text-2xl text-zinc-500 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="space-y-8 py-6">
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Subscription
                </h3>

                <Link
                  href="/pricing"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm transition hover:border-pink-500/50 hover:bg-zinc-900"
                >
                  <span>Manage subscriptions</span>
                  <span className="text-pink-400">→</span>
                </Link>
              </section>

              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Delete materials
                </h3>

                <div className="space-y-2">
                  {[10, 50, 100].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      disabled={deleting !== null}
                      onClick={() =>
                        deleteMaterials(amount as 10 | 50 | 100)
                      }
                      className="flex w-full justify-between rounded-xl border border-zinc-800 px-4 py-3 text-left text-sm text-zinc-300 transition hover:border-amber-500/50 hover:bg-amber-500/10 disabled:opacity-50"
                    >
                      <span>Delete oldest {amount}</span>
                      {deleting === amount && <span>Deleting...</span>}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={deleting !== null}
                    onClick={() => deleteMaterials("all")}
                    className="flex w-full justify-between rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-left text-sm text-red-300 transition hover:bg-red-500/15 disabled:opacity-50"
                  >
                    <span>Delete all materials</span>
                    {deleting === "all" && <span>Deleting...</span>}
                  </button>
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Account
                </h3>

                <button
                  type="button"
                  onClick={deleteAccount}
                  className="mb-2 w-full rounded-xl border border-red-500/30 px-4 py-3 text-left text-sm text-red-400 transition hover:bg-red-500/10"
                >
                  Delete account
                </button>

                <Link
                  href="/logout"
                  className="block w-full rounded-xl border border-zinc-800 px-4 py-3 text-sm text-zinc-300 transition hover:bg-zinc-900"
                >
                  Log out
                </Link>
              </section>

              {message && (
                <p
                  role="status"
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400"
                >
                  {message}
                </p>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

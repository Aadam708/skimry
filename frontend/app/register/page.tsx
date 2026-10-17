import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-black px-4 py-16">
      <Link
        href="/"
        className="absolute left-6 top-6 flex items-center gap-2 text-sm text-white transition-colors hover:text-pink-500 duration-500"
      >
        <span aria-hidden="true" className="text-lg">
          ←
        </span>
        <span>Return home</span>
      </Link>

      <div className="flex w-full flex-col items-center gap-5">
        <SignUp
          routing="hash"
          forceRedirectUrl="/auth/complete"
          signInUrl="/login"
        />

        <p className="max-w-sm text-center text-xs leading-relaxed text-zinc-500">
          By signing up, you agree to our{" "}
          <Link
            href="/terms-of-service"
            className="text-pink-400 underline underline-offset-2 transition-colors hover:text-pink-300"
          >
            Terms of Service
          </Link>
          .
        </p>
      </div>
    </main>
  );
}

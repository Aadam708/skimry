import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4">
      <SignUp
        routing="hash"
        forceRedirectUrl="/auth/complete"
        signInUrl="/login"
      />
    </main>
  );
}

import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4">
      <SignIn
        routing="hash"
        forceRedirectUrl="/auth/complete"
        signUpUrl="/register"
      />
    </main>
  );
}

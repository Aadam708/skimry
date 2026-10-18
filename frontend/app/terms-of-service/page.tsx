import Link from "next/link";

const sections = [
  {
    title: "1. Description of Service",
    content:
      "Skimry provides automated article extraction, summarization, and saved reading materials through its website and browser extension. We may modify, suspend, or discontinue any part of the Service at any time.",
  },
  {
    title: "2. User Accounts and Security",
    content:
      "Account registration and identity management are powered by third-party authentication providers, including Clerk. You agree to provide accurate and current account information and are responsible for activity under your account.",
  },
  {
    title: "3. Subscriptions, Payments, and Billing",
    content:
      "Payment processing, subscription management, and billing are handled securely by Stripe. Paid subscriptions renew at the selected billing interval until cancelled. You may cancel through the Plans Page or the Stripe Billing Portal. Payments are generally non-refundable except where required by law.",
  },
  {
    title: "4. Third-Party Infrastructure and Outages",
    content:
      "The Service relies on third-party providers, including Railway, Aiven, Stripe, and Clerk. We do not guarantee uninterrupted or error-free access and are not responsible for outages, maintenance, database issues, API failures, or other third-party infrastructure problems.",
  },
  {
    title: "5. Limitation of Liability",
    content:
      "To the maximum extent permitted by applicable law, Skimry and its directors, employees, and partners will not be liable for indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, use, goodwill, or access to the Service.",
  },
  {
    title: "6. Disclaimer of Warranties",
    content:
      'The Service is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied.',
  },
  {
    title: "7. Acceptable Use",
    content:
      "You agree not to use the Service for illegal, unauthorized, or fraudulent purposes; reverse-engineer or decompile the Service; or disrupt, overload, or compromise our servers or networks.",
  },
  {
    title: "8. Termination",
    content:
      "We may suspend or terminate your account and access to the Service without prior notice if you breach these Terms or engage in fraudulent activity.",
  },
  {
    title: "9. Changes to Terms",
    content:
      "We may update these Terms from time to time. Continued use of the Service after changes take effect means you accept the revised Terms.",
  },
];

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto max-w-4xl px-6 py-24 sm:px-10">

        <header className="border-b border-zinc-800 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-pink-400">
            Legal
          </p>

          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Terms of Service
          </h1>

          <p className="mt-4 text-sm text-zinc-500">
            Last updated: October 17, 2026
          </p>
        </header>

        <div className="prose prose-invert mt-10 max-w-none">
          <p className="text-base leading-8 text-zinc-300">
            Welcome to Skimry. By accessing or using our website, applications,
            browser extension, and services, you agree to be bound by these
            Terms of Service. If you do not agree to these Terms, please do not
            use the Service.
          </p>

          <div className="mt-10 space-y-10">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-bold text-white">
                  {section.title}
                </h2>

                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  {section.content}
                </p>
              </section>
            ))}

            <section>
              <h2 className="text-xl font-bold text-white">10. Contact Us</h2>

              <p className="mt-3 text-sm leading-7 text-zinc-400">
                If you have questions or concerns regarding these Terms of
                Service, contact us at{" "}
                <a
                  href="mailto:support@skimry.com"
                  className="text-pink-400 underline underline-offset-4 hover:text-pink-300"
                >
                  support@skimry.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

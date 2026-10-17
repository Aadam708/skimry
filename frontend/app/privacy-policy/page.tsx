import Link from "next/link";

const sections = [
  {
    title: "1. Information We Collect",
    content: (
      <>
        <p>
          <strong className="text-zinc-200">
            Account and Authentication Data:
          </strong>{" "}
          When you sign up, identity management is handled by Clerk. We
          receive basic account details such as your email address and Clerk
          authentication ID.
        </p>

        <p className="mt-4">
          <strong className="text-zinc-200">Payment Information:</strong>{" "}
          Payment processing is handled directly by Stripe. We do not collect
          or store full card numbers on our servers. Stripe provides us with
          transaction identifiers and subscription status.
        </p>

        <p className="mt-4">
          <strong className="text-zinc-200">Usage and Log Data:</strong> We
          collect basic server logs and usage telemetry, including IP
          addresses and browser headers, for rate limiting, security, and
          performance monitoring.
        </p>
      </>
    ),
  },
  {
    title: "2. How We Use Your Information",
    content: (
      <>
        <p>We use your information to:</p>

        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>Provide, maintain, and secure the Skimry service.</li>
          <li>
            Process subscription payments and manage access to paid features.
          </li>
          <li>
            Respond to customer support requests sent to support@skimry.com.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "3. Third-Party Service Providers",
    content: (
      <>
        <p>
          We share necessary data with trusted third-party providers required
          to operate the Service:
        </p>

        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>
            <strong className="text-zinc-200">Clerk:</strong> Authentication
            and identity management.
          </li>
          <li>
            <strong className="text-zinc-200">Stripe:</strong> Billing and
            payment processing.
          </li>
          <li>
            <strong className="text-zinc-200">Railway and Aiven:</strong>{" "}
            Hosting, application servers, and database infrastructure.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "4. Data Security",
    content: (
      <p>
        We implement security measures including encrypted HTTPS connections,
        secure HttpOnly cookies, and database access controls to help protect
        your information from unauthorized access.
      </p>
    ),
  },
  {
    title: "5. Your Rights",
    content: (
      <p>
        Depending on your location, you may have the right to access, update,
        or request deletion of your personal data. You can exercise these
        rights by contacting us.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto max-w-4xl px-6 py-24 sm:px-10">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-pink-400"
        >
          <span aria-hidden="true">←</span>
          Return home
        </Link>

        <header className="border-b border-zinc-800 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-pink-400">
            Legal
          </p>

          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Privacy Policy
          </h1>

          <p className="mt-4 text-sm text-zinc-500">
            Last updated: October 17, 2026
          </p>
        </header>

        <div className="mt-10 space-y-10 text-sm leading-7 text-zinc-400">
          <p className="text-base leading-8 text-zinc-300">
            Skimry respects your privacy. This Privacy Policy explains how we
            collect, use, and protect your information when you use our
            website, browser extension, and services.
          </p>

          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-bold text-white">
                {section.title}
              </h2>

              <div className="mt-3">{section.content}</div>
            </section>
          ))}

          <section>
            <h2 className="text-xl font-bold text-white">6. Contact Us</h2>

            <p className="mt-3">
              If you have questions about this Privacy Policy or your data,
              contact us at{" "}
              <a
                href="mailto:support@skimry.com"
                className="text-pink-400 underline underline-offset-4 transition-colors hover:text-pink-300"
              >
                support@skimry.com
              </a>
              .
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";

export default function FooterComponent() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-900 text-zinc-400">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-100">Skimry</p>
          <p className="mt-1 text-xs text-zinc-500">
            Read less. Understand more.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm sm:items-end">
          <a
            href="mailto:support@skimry.com"
            className="transition-colors hover:text-pink-400"
          >
            support@skimry.com
          </a>

          <div className="flex gap-4">
            <Link
              href="/terms-of-service"
              target="_blank"
              className="transition-colors hover:text-pink-400"
            >
              Terms of Service
            </Link>

            <Link
              href="/privacy-policy"
              target="_blank"
              className="transition-colors hover:text-pink-400"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

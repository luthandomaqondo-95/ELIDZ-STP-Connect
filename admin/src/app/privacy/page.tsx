import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-zinc-800 dark:text-zinc-100">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
        ELIDZ STP Connect collects account details you provide (such as name, email, and
        organisation information) to operate the admin dashboard and mobile services. We use
        this information to authenticate users, manage SMME verification, and deliver platform
        features. We do not sell personal information.
      </p>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
        Access to administrative areas is restricted to authorised staff. Session cookies are
        used to keep you signed in securely. Contact ELIDZ support if you need to update or
        remove account data.
      </p>
      <p className="mt-8 text-sm">
        <Link href="/auth/login" className="text-sky-700 underline-offset-2 hover:underline dark:text-sky-300">
          Back to sign in
        </Link>
      </p>
    </main>
  );
}

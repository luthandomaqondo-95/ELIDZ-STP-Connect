import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-zinc-800 dark:text-zinc-100">
      <h1 className="text-3xl font-semibold tracking-tight">Terms &amp; Conditions</h1>
      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
        By signing in to ELIDZ STP Connect, you agree to use the platform only for authorised
        Science &amp; Technology Park operations, protect account credentials, and handle
        member and SMME data responsibly.
      </p>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
        Misuse of administrative tools, unauthorised access attempts, or sharing of
        confidential information may result in account suspension. ELIDZ may update these
        terms as the platform evolves; continued use constitutes acceptance of the current
        version.
      </p>
      <p className="mt-8 text-sm">
        <Link href="/auth/login" className="text-sky-700 underline-offset-2 hover:underline dark:text-sky-300">
          Back to sign in
        </Link>
      </p>
    </main>
  );
}

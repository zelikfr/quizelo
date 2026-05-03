import { signOutAction } from "@/app/actions/auth";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-lg border border-line bg-bg-1 p-8 text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-fg-3">403</div>
        <h1 className="mt-1 text-2xl font-semibold text-fg-0">Forbidden</h1>
        <p className="mt-3 text-sm text-fg-2">
          Your account is not on the admin allowlist.
        </p>
        <form action={signOutAction} className="mt-6">
          <button
            type="submit"
            className="rounded-md border border-line bg-bg-2 px-4 py-2 text-sm text-fg-1 hover:bg-bg-3"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

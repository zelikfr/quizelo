import { redirect } from "next/navigation";
import { signIn } from "@/auth";

async function loginAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch {
    // Generic error — we don't want to leak whether the email is admin
    // or not. The Credentials authorize fn already returned null (which
    // throws CredentialsSignin) for any non-admin / wrong password.
    redirect("/login?error=1");
  }
  redirect("/");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-lg border border-line bg-bg-1 p-8">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-[0.3em] text-fg-3">Quizelo</div>
          <div className="mt-1 text-2xl font-semibold text-fg-0">Backoffice</div>
          <p className="mt-2 text-sm text-fg-2">Sign in with your admin account.</p>
        </div>

        <form action={loginAction} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-fg-3" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              className="w-full rounded-md border border-line bg-bg-2 px-3 py-2 text-sm text-fg-1 outline-none focus:border-accent"
            />
          </div>

          <div>
            <label
              className="mb-1 block text-xs uppercase tracking-widest text-fg-3"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-md border border-line bg-bg-2 px-3 py-2 text-sm text-fg-1 outline-none focus:border-accent"
            />
          </div>

          {error && (
            <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
              Invalid credentials.
            </div>
          )}

          <button
            type="submit"
            className="mt-2 w-full rounded-md bg-accent py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-fg-3">
          Access restricted to allowlisted accounts.
        </p>
      </div>
    </div>
  );
}

import { login } from "./actions";

const inputClass =
  "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-semibold tracking-tight">
          AAposta CRM
        </h1>
        <p className="mt-1 text-center text-sm text-neutral-500">
          Entre para continuar
        </p>

        <form action={login} className="mt-8 space-y-4">
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <div>
            <label
              className="block text-sm font-medium text-neutral-700"
              htmlFor="email"
            >
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={inputClass}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-neutral-700"
              htmlFor="password"
            >
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}

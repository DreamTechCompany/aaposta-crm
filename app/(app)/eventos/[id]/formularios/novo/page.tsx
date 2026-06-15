import Link from "next/link";
import { createForm } from "../actions";

const inputClass =
  "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";
const labelClass = "block text-sm font-medium text-neutral-700";

export default async function NovoFormularioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const action = createForm.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/eventos/${id}/formularios`}
        className="text-sm text-neutral-500 hover:underline"
      >
        ← Formulários
      </Link>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">
        Novo formulário
      </h1>

      <form action={action} className="mt-6 space-y-5">
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div>
          <label className={labelClass} htmlFor="title">
            Título *
          </label>
          <input id="title" name="title" required className={inputClass} />
        </div>

        <div>
          <label className={labelClass} htmlFor="description">
            Descrição
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className={inputClass}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Criar e adicionar campos
          </button>
          <Link
            href={`/eventos/${id}/formularios`}
            className="rounded-md px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

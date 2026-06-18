import { ExhibitorForm } from "../exhibitor-form";
import { createExhibitor } from "../actions";

export default async function NovoExpositorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Novo cliente</h1>
      <div className="mt-6">
        <ExhibitorForm
          action={createExhibitor}
          submitLabel="Criar cliente"
          error={error}
          cancelHref="/expositores"
        />
      </div>
    </div>
  );
}

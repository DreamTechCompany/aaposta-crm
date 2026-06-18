import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type ExhibitorRow } from "@/lib/types";
import { ExhibitorForm } from "../../exhibitor-form";
import { updateExhibitor } from "../../actions";

export default async function EditarExpositorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();
  const { data: exhibitor } = await supabase
    .from("exhibitors")
    .select("*")
    .eq("id", id)
    .single<ExhibitorRow>();

  if (!exhibitor) notFound();

  const action = updateExhibitor.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Editar lead</h1>
      <div className="mt-6">
        <ExhibitorForm
          action={action}
          exhibitor={exhibitor}
          submitLabel="Salvar"
          error={error}
          cancelHref={`/expositores/${exhibitor.id}`}
        />
      </div>
    </div>
  );
}

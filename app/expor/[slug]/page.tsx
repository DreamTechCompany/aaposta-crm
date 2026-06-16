import { createAdminClient } from "@/lib/supabase/admin";
import { ExhibitorForm } from "@/app/(app)/expositores/exhibitor-form";
import { registerExhibitor } from "./actions";

export default async function ExporPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { slug } = await params;
  const { sent, error } = await searchParams;
  const supabase = createAdminClient();

  const { data: event } = await supabase
    .from("events")
    .select("name")
    .eq("slug", slug)
    .maybeSingle<{ name: string }>();

  if (!event) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Cadastro indisponível
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Este link de cadastro não existe ou foi removido.
        </p>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Cadastro enviado
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Obrigado! Recebemos o seu cadastro para o evento {event.name}.
        </p>
      </div>
    );
  }

  const action = registerExhibitor.bind(null, slug);

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">
        Cadastro de expositor
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        Evento: <span className="font-medium">{event.name}</span>
      </p>

      <div className="mt-8">
        <ExhibitorForm
          action={action}
          submitLabel="Enviar cadastro"
          error={error}
        />
      </div>
    </div>
  );
}

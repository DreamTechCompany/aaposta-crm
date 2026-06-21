import { createAdminClient } from "@/lib/supabase/admin";
import { registerExhibitor } from "./actions";
import { PublicRegistration } from "./public-registration";
import { RegistrationSuccess } from "./registration-success";

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
    .select("name, location, starts_at")
    .eq("slug", slug)
    .maybeSingle<{ name: string; location: string | null; starts_at: string | null }>();

  if (!event) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          Cadastro indisponível
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Este link de cadastro não existe ou foi removido.
        </p>
      </div>
    );
  }

  if (sent) {
    return <RegistrationSuccess eventName={event.name} />;
  }

  const action = registerExhibitor.bind(null, slug);

  return (
    <PublicRegistration
      event={{
        name: event.name,
        location: event.location,
        startsAt: event.starts_at,
      }}
      action={action}
      error={error}
    />
  );
}

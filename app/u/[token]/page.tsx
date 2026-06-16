import { createAdminClient } from "@/lib/supabase/admin";
import { submitSignedDocument } from "./actions";

type Participation = {
  id: string;
  exhibitor: { company_name: string } | null;
  event: { name: string } | null;
};

export default async function UploadPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { token } = await params;
  const { sent, error } = await searchParams;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("event_exhibitors")
    .select("id, exhibitor:exhibitors(company_name), event:events(name)")
    .eq("public_token", token)
    .maybeSingle();

  const participation = data as unknown as Participation | null;

  if (!participation) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Link inválido
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Este link de upload não existe ou expirou.
        </p>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Documento enviado
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Obrigado! Recebemos o seu contrato assinado.
        </p>
      </div>
    );
  }

  const action = submitSignedDocument.bind(null, token);

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">
        Envio do contrato assinado
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        {participation.exhibitor?.company_name}
        {participation.event?.name && ` · ${participation.event.name}`}
      </p>

      {error && (
        <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form action={action} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="file"
            className="block text-sm font-medium text-neutral-700"
          >
            Contrato assinado (PDF ou imagem, até 15 MB)
          </label>
          <input
            id="file"
            name="file"
            type="file"
            required
            accept=".pdf,image/*"
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Enviar documento
        </button>
      </form>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { type FormRow, type FormFieldRow } from "@/lib/types";
import { submitPublicForm } from "./actions";

const inputClass =
  "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";
const labelClass = "block text-sm font-medium text-neutral-700";

function Field({ field }: { field: FormFieldRow }) {
  const name = `field_${field.id}`;
  const required = field.is_required;

  if (field.field_type === "checkbox") {
    return (
      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input type="checkbox" name={name} />
        {field.label}
        {required && <span className="text-red-500">*</span>}
      </label>
    );
  }

  const label = (
    <span className={labelClass}>
      {field.label}
      {required && <span className="text-red-500"> *</span>}
    </span>
  );

  if (field.field_type === "textarea") {
    return (
      <label className="block">
        {label}
        <textarea name={name} rows={3} required={required} className={inputClass} />
      </label>
    );
  }

  if (field.field_type === "select" || field.field_type === "multiselect") {
    const options = field.options ?? [];
    if (field.field_type === "multiselect") {
      return (
        <fieldset>
          {label}
          <div className="mt-1 space-y-1">
            {options.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 text-sm text-neutral-700"
              >
                <input type="checkbox" name={name} value={opt} />
                {opt}
              </label>
            ))}
          </div>
        </fieldset>
      );
    }
    return (
      <label className="block">
        {label}
        <select
          name={name}
          required={required}
          defaultValue=""
          className={inputClass}
        >
          <option value="" disabled>
            Selecione…
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
    );
  }

  const typeMap: Record<string, string> = {
    text: "text",
    number: "number",
    email: "email",
    phone: "tel",
    date: "date",
  };

  return (
    <label className="block">
      {label}
      <input
        type={typeMap[field.field_type] ?? "text"}
        name={name}
        required={required}
        className={inputClass}
      />
    </label>
  );
}

export default async function PublicFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ public_slug: string }>;
  searchParams: Promise<{ sent?: string; error?: string; e?: string }>;
}) {
  const { public_slug } = await params;
  const { sent, error, e } = await searchParams;
  const supabase = await createClient();

  const { data: form } = await supabase
    .from("forms")
    .select("*")
    .eq("public_slug", public_slug)
    .eq("is_active", true)
    .maybeSingle<FormRow>();

  if (!form) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Formulário indisponível
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Este link não está mais ativo ou não existe.
        </p>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Resposta enviada
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Obrigado! Recebemos as suas informações.
        </p>
      </div>
    );
  }

  const { data: fieldsData } = await supabase
    .from("form_fields")
    .select("*")
    .eq("form_id", form.id)
    .order("position", { ascending: true });

  const fields = (fieldsData ?? []) as FormFieldRow[];
  const action = submitPublicForm.bind(null, public_slug);

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">{form.title}</h1>
      {form.description && (
        <p className="mt-2 text-sm text-neutral-600">{form.description}</p>
      )}

      {error && (
        <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {fields.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">
          Este formulário ainda não tem campos.
        </p>
      ) : (
        <form action={action} className="mt-8 space-y-5">
          {e && <input type="hidden" name="e" value={e} />}
          {fields.map((field) => (
            <Field key={field.id} field={field} />
          ))}
          <button
            type="submit"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Enviar
          </button>
        </form>
      )}
    </div>
  );
}

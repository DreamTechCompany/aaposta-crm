import Link from "next/link";
import { type ExhibitorRow } from "@/lib/types";

const inputClass =
  "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";
const labelClass = "block text-sm font-medium text-neutral-700";

export function ExhibitorForm({
  action,
  exhibitor,
  submitLabel,
  error,
}: {
  action: (formData: FormData) => void | Promise<void>;
  exhibitor?: ExhibitorRow;
  submitLabel: string;
  error?: string;
}) {
  return (
    <form action={action} className="space-y-5">
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div>
        <label className={labelClass} htmlFor="company_name">
          Empresa *
        </label>
        <input
          id="company_name"
          name="company_name"
          required
          defaultValue={exhibitor?.company_name ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="cnpj">
          CNPJ
        </label>
        <input
          id="cnpj"
          name="cnpj"
          defaultValue={exhibitor?.cnpj ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="contact_name">
          Contato
        </label>
        <input
          id="contact_name"
          name="contact_name"
          defaultValue={exhibitor?.contact_name ?? ""}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="contact_email">
            E-mail
          </label>
          <input
            id="contact_email"
            name="contact_email"
            type="email"
            defaultValue={exhibitor?.contact_email ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="contact_phone">
            Telefone
          </label>
          <input
            id="contact_phone"
            name="contact_phone"
            type="tel"
            defaultValue={exhibitor?.contact_phone ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="notes">
          Observações
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={exhibitor?.notes ?? ""}
          className={inputClass}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          {submitLabel}
        </button>
        <Link
          href="/expositores"
          className="rounded-md px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

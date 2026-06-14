import Link from "next/link";
import { EVENT_STATUSES, statusLabel, type EventRow } from "@/lib/types";

const inputClass =
  "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";
const labelClass = "block text-sm font-medium text-neutral-700";

export function EventForm({
  action,
  event,
  submitLabel,
  error,
}: {
  action: (formData: FormData) => void | Promise<void>;
  event?: EventRow;
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
        <label className={labelClass} htmlFor="name">
          Nome *
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={event?.name ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="location">
          Local
        </label>
        <input
          id="location"
          name="location"
          defaultValue={event?.location ?? ""}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="starts_at">
            Início
          </label>
          <input
            id="starts_at"
            name="starts_at"
            type="date"
            defaultValue={event?.starts_at ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="ends_at">
            Fim
          </label>
          <input
            id="ends_at"
            name="ends_at"
            type="date"
            defaultValue={event?.ends_at ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="status">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={event?.status ?? "planejamento"}
          className={inputClass}
        >
          {EVENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="notes">
          Observações
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={event?.notes ?? ""}
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
          href="/eventos"
          className="rounded-md px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

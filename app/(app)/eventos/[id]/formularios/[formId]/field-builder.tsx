"use client";

import { useState, useTransition } from "react";
import {
  FIELD_TYPES,
  fieldHasOptions,
  fieldTypeLabel,
  type FieldType,
  type FormFieldRow,
} from "@/lib/types";
import { saveFields, type FieldInput } from "../actions";

// Campo no estado local — id opcional (novos campos ainda não têm) + uma key
// estável só pra renderização do React.
type DraftField = {
  key: string;
  id?: string;
  label: string;
  field_type: FieldType;
  options: string; // editado como texto, uma opção por linha
  is_required: boolean;
};

let keySeq = 0;
function newKey() {
  return `f${keySeq++}`;
}

function toDraft(field: FormFieldRow): DraftField {
  return {
    key: newKey(),
    id: field.id,
    label: field.label,
    field_type: field.field_type,
    options: (field.options ?? []).join("\n"),
    is_required: field.is_required,
  };
}

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";

export function FieldBuilder({
  eventId,
  formId,
  initialFields,
}: {
  eventId: string;
  formId: string;
  initialFields: FormFieldRow[];
}) {
  const [fields, setFields] = useState<DraftField[]>(
    initialFields.map(toDraft),
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function update(key: string, patch: Partial<DraftField>) {
    setSaved(false);
    setFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, ...patch } : f)),
    );
  }

  function addField() {
    setSaved(false);
    setFields((prev) => [
      ...prev,
      {
        key: newKey(),
        label: "",
        field_type: "text",
        options: "",
        is_required: false,
      },
    ]);
  }

  function removeField(key: string) {
    setSaved(false);
    setFields((prev) => prev.filter((f) => f.key !== key));
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= fields.length) return;
    setSaved(false);
    setFields((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function save() {
    setError(null);
    const payload: FieldInput[] = fields.map((f) => ({
      id: f.id,
      label: f.label.trim(),
      field_type: f.field_type,
      options: fieldHasOptions(f.field_type)
        ? f.options
            .split("\n")
            .map((o) => o.trim())
            .filter(Boolean)
        : null,
      is_required: f.is_required,
    }));

    startTransition(async () => {
      const result = await saveFields(eventId, formId, payload);
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(true);
      }
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {saved && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Campos salvos.
        </p>
      )}

      {fields.length === 0 && (
        <p className="text-sm text-neutral-500">
          Nenhum campo ainda. Adicione o primeiro abaixo.
        </p>
      )}

      {fields.map((field, index) => (
        <div
          key={field.key}
          className="rounded-lg border border-neutral-200 bg-white p-4"
        >
          <div className="flex items-start gap-3">
            <div className="flex flex-col gap-1 pt-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="text-neutral-400 hover:text-neutral-700 disabled:opacity-30"
                aria-label="Mover para cima"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === fields.length - 1}
                className="text-neutral-400 hover:text-neutral-700 disabled:opacity-30"
                aria-label="Mover para baixo"
              >
                ↓
              </button>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex gap-3">
                <input
                  value={field.label}
                  onChange={(e) => update(field.key, { label: e.target.value })}
                  placeholder="Rótulo do campo"
                  className={inputClass}
                />
                <select
                  value={field.field_type}
                  onChange={(e) =>
                    update(field.key, {
                      field_type: e.target.value as FieldType,
                    })
                  }
                  className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {fieldTypeLabel(t)}
                    </option>
                  ))}
                </select>
              </div>

              {fieldHasOptions(field.field_type) && (
                <textarea
                  value={field.options}
                  onChange={(e) =>
                    update(field.key, { options: e.target.value })
                  }
                  rows={3}
                  placeholder="Uma opção por linha"
                  className={inputClass}
                />
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-neutral-600">
                  <input
                    type="checkbox"
                    checked={field.is_required}
                    onChange={(e) =>
                      update(field.key, { is_required: e.target.checked })
                    }
                  />
                  Obrigatório
                </label>
                <button
                  type="button"
                  onClick={() => removeField(field.key)}
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  Remover campo
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={addField}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
        >
          + Adicionar campo
        </button>
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {isPending ? "Salvando…" : "Salvar campos"}
        </button>
      </div>
    </div>
  );
}

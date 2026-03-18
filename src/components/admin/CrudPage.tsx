import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'

type FieldType = 'text' | 'number' | 'textarea' | 'select'

export type CrudField = {
  name: string
  label: string
  type: FieldType
  required?: boolean
  options?: string[]
}

type CrudPageProps<T extends { id: number }> = {
  title: string
  fields: CrudField[]
  rows: T[]
  loading: boolean
  error: string
  onCreate: (payload: Record<string, unknown>) => Promise<void>
  onUpdate: (id: number, payload: Record<string, unknown>) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

const buildInitialForm = (fields: CrudField[]) =>
  fields.reduce<Record<string, string>>((acc, field) => {
    acc[field.name] = ''
    return acc
  }, {})

export default function CrudPage<T extends { id: number }>({
  title,
  fields,
  rows,
  loading,
  error,
  onCreate,
  onUpdate,
  onDelete
}: CrudPageProps<T>) {
  const initialForm = useMemo(() => buildInitialForm(fields), [fields])
  const [form, setForm] = useState<Record<string, string>>(initialForm)
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Record<string, string>>(initialForm)
  const [busy, setBusy] = useState(false)

  const inputClass = 'w-full rounded-md border border-border bg-background px-3 py-2 text-sm'

  const handleCreate = async () => {
    setBusy(true)
    try {
      await onCreate(form)
      setForm(initialForm)
    } finally {
      setBusy(false)
    }
  }

  const startEdit = (row: T) => {
    const next = { ...initialForm }
    fields.forEach((field) => {
      const value = (row as Record<string, unknown>)[field.name]
      next[field.name] = value === null || value === undefined ? '' : String(value)
    })
    setEditForm(next)
    setEditId(row.id)
  }

  const handleUpdate = async () => {
    if (!editId) return
    setBusy(true)
    try {
      await onUpdate(editId, editForm)
      setEditId(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="font-serif text-4xl font-bold text-foreground">{title}</h1>

      <section className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h2 className="text-lg font-semibold">Add New</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {fields.map((field) => {
            if (field.type === 'textarea') {
              return (
                <textarea
                  key={field.name}
                  className={`${inputClass} min-h-24 md:col-span-2`}
                  placeholder={field.label}
                  value={form[field.name]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
                />
              )
            }
            if (field.type === 'select') {
              return (
                <select
                  key={field.name}
                  className={inputClass}
                  value={form[field.name]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
                >
                  <option value="">{field.label}</option>
                  {(field.options || []).map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              )
            }
            return (
              <input
                key={field.name}
                className={inputClass}
                type={field.type}
                placeholder={field.label}
                value={form[field.name]}
                onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
              />
            )
          })}
        </div>
        <Button disabled={busy || loading} onClick={handleCreate}>Add</Button>
      </section>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <section className="rounded-xl border border-border bg-card p-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              {fields.map((field) => (
                <th key={field.name} className="py-2 pr-4">{field.label}</th>
              ))}
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isEditing = editId === row.id
              return (
                <tr key={row.id} className="border-b border-border/60">
                  {fields.map((field) => (
                    <td key={`${row.id}-${field.name}`} className="py-2 pr-4 align-top">
                      {isEditing ? (
                        field.type === 'textarea' ? (
                          <textarea
                            className={`${inputClass} min-h-20`}
                            value={editForm[field.name]}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
                          />
                        ) : field.type === 'select' ? (
                          <select
                            className={inputClass}
                            value={editForm[field.name]}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
                          >
                            <option value="">Select</option>
                            {(field.options || []).map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            className={inputClass}
                            type={field.type}
                            value={editForm[field.name]}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
                          />
                        )
                      ) : (
                        <span>{String((row as Record<string, unknown>)[field.name] ?? '')}</span>
                      )}
                    </td>
                  ))}
                  <td className="py-2 space-x-2 whitespace-nowrap">
                    {isEditing ? (
                      <>
                        <Button size="sm" disabled={busy} onClick={handleUpdate}>Save</Button>
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => setEditId(null)}>Cancel</Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => startEdit(row)}>Edit</Button>
                        <Button size="sm" variant="destructive" disabled={busy} onClick={() => onDelete(row.id)}>Delete</Button>
                      </>
                    )}
                  </td>
                </tr>
              )
            })}
            {!rows.length && !loading && (
              <tr>
                <td className="py-4 text-muted-foreground" colSpan={fields.length + 1}>No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}

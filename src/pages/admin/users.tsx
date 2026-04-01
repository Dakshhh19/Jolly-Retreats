import { useEffect, useState } from 'react'
import CrudPage, { type CrudField } from '@/components/admin/CrudPage'
import { adminApi, type AdminUser } from '@/services/adminApi'

const fields: CrudField[] = [
  { name: 'fullName', label: 'Full Name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'text', required: true },
  { name: 'password', label: 'Password', type: 'text' },
  { name: 'contactNumber', label: 'Contact Number', type: 'text', required: true },
  { name: 'role', label: 'Role', type: 'select', options: ['user', 'admin'], required: true },
  { name: 'isBlocked', label: 'Blocked', type: 'select', options: ['false', 'true'], required: true }
]

export default function AdminUsersPage() {
  const [rows, setRows] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setRows(await adminApi.users.list())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <CrudPage
      title="Users Management"
      fields={fields}
      rows={rows}
      loading={loading}
      error={error}
      onCreate={async (payload) => {
        await adminApi.users.create({
          fullName: String(payload.fullName || ''),
          email: String(payload.email || ''),
          password: String(payload.password || ''),
          contactNumber: String(payload.contactNumber || ''),
          role: (payload.role as 'user' | 'admin') || 'user',
          isBlocked: String(payload.isBlocked || 'false') === 'true'
        })
        await load()
      }}
      onUpdate={async (id, payload) => {
        const password = String(payload.password || '').trim()
        await adminApi.users.update(id, {
          fullName: String(payload.fullName || ''),
          email: String(payload.email || ''),
          contactNumber: String(payload.contactNumber || ''),
          role: (payload.role as 'user' | 'admin') || 'user',
          isBlocked: String(payload.isBlocked || 'false') === 'true',
          ...(password ? { password } : {})
        })
        await load()
      }}
      onDelete={async (id) => {
        await adminApi.users.delete(id)
        await load()
      }}
    />
  )
}

import { query } from '../config/db.js'
import { buildUpdateClause } from './modelUtils.js'

const baseSelect = `
  SELECT id, full_name, email, password_hash, contact_number, role, is_blocked, created_at
  FROM users
`

export const usersModel = {
  async findByEmail(email) {
    const rows = await query(`${baseSelect} WHERE email = ? LIMIT 1`, [email])
    return rows[0] || null
  },

  async findByContactNumber(contactNumber) {
    const rows = await query(`${baseSelect} WHERE contact_number = ? LIMIT 1`, [contactNumber])
    return rows[0] || null
  },

  async findById(id) {
    const rows = await query(`${baseSelect} WHERE id = ? LIMIT 1`, [id])
    return rows[0] || null
  },

  async getAll() {
    return query(
      `SELECT id, full_name, email, contact_number, role, is_blocked, created_at FROM users ORDER BY created_at DESC`
    )
  },

  async create({ fullName, email, passwordHash, contactNumber, role = 'user', isBlocked = false }) {
    const result = await query(
      `INSERT INTO users (full_name, email, password_hash, contact_number, role, is_blocked)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fullName, email, passwordHash, contactNumber, role, isBlocked ? 1 : 0]
    )
    return this.findById(result.insertId)
  },

  async updateById(id, payload) {
    const update = buildUpdateClause({
      full_name: payload.fullName,
      email: payload.email,
      password_hash: payload.passwordHash,
      contact_number: payload.contactNumber,
      role: payload.role,
      is_blocked: payload.isBlocked
    })

    if (!update) {
      return this.findById(id)
    }

    await query(`UPDATE users SET ${update.setClause} WHERE id = ?`, [...update.values, id])
    return this.findById(id)
  },

  async deleteById(id) {
    const result = await query(`DELETE FROM users WHERE id = ?`, [id])
    return result.affectedRows > 0
  }
}

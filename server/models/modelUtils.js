export const buildUpdateClause = (fields) => {
  const entries = Object.entries(fields).filter(([, value]) => value !== undefined)
  if (!entries.length) {
    return null
  }

  const setClause = entries.map(([key]) => `${key} = ?`).join(', ')
  const values = entries.map(([, value]) => value)

  return { setClause, values }
}

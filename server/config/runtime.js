let dbConnected = false

export const setDbConnected = (value) => {
  dbConnected = Boolean(value)
}

export const isDbConnected = () => dbConnected

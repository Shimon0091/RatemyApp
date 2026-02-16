const isDev = import.meta.env.MODE === 'development'

export const logger = {
  log: (...args) => isDev && console.log(...args),
  error: (...args) => console.error(...args),
  warn: (...args) => isDev && console.warn(...args),
}

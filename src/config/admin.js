// Fallback admin emails (only if DB check fails)
export const FALLBACK_ADMIN_EMAILS = [
  'SHIMON@FRAME-5.COM',
  'shimon0091@gmail.com',
]

// Get admin emails from environment or fallback
export const getAdminEmails = () => {
  const envEmails = import.meta.env.VITE_ADMIN_EMAILS
  if (envEmails) {
    return envEmails.split(',').map(e => e.trim())
  }
  return FALLBACK_ADMIN_EMAILS
}

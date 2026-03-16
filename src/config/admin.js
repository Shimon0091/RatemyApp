// Get admin emails from environment variable
// Set VITE_ADMIN_EMAILS in .env (comma-separated)
export const getAdminEmails = () => {
  const envEmails = import.meta.env.VITE_ADMIN_EMAILS
  if (envEmails) {
    return envEmails.split(',').map(e => e.trim())
  }
  return []
}

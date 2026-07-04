import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Icon from './icons'
import { CONSENT_OPEN_EVENT } from '../lib/analytics'

export default function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  // Re-open the cookie banner so a user can review or withdraw consent at any
  // time — as easily as it was given (Amendment 13 §8C symmetry).
  const openCookieConsent = () => {
    window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))
  }

  return (
    <footer className="bg-petrol-700 text-white mt-auto font-body">
      <div className="max-w-6xl mx-auto px-5 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand & Description */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/10">
                <Icon.Home className="w-[18px] h-[18px]" />
              </span>
              <span className="text-2xl font-heading font-extrabold">{t('app.name')}</span>
            </div>
            <p className="mt-4 text-white/70 leading-relaxed text-sm">
              {t('footer.description')}
            </p>
            <div className="flex gap-3 mt-5">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="אינסטגרם" className="btn grid place-items-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="3.5" /><path d="M17.5 6.5h.01" /></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="פייסבוק" className="btn grid place-items-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V6h-3c-2 0-3.5 1.5-3.5 3.5V11H8v3h2.5v7h3v-7H16l.5-3h-3V9.5c0-.3.2-.5.5-.5Z" /></svg>
              </a>
              <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X" className="btn grid place-items-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h3l-7 8 8 12h-6l-5-7-6 7H2l8-9L2 2h6l4 6 6-6Zm-2 18h1.5L8 4H6.5L16 20Z" /></svg>
              </a>
            </div>
          </div>

          {/* Product / Quick links */}
          <div>
            <h4 className="font-heading font-bold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li><Link to="/" className="hover:text-white transition-colors">{t('nav.home')}</Link></li>
              <li><Link to="/search" className="hover:text-white transition-colors">{t('footer.searchProperties')}</Link></li>
              <li><Link to="/write-review" className="hover:text-white transition-colors">{t('nav.writeReview')}</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">{t('nav.login')}</Link></li>
            </ul>
          </div>

          {/* Company / About */}
          <div>
            <h4 className="font-heading font-bold mb-4">{t('nav.about')}</h4>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li><Link to="/about" className="hover:text-white transition-colors">{t('nav.about')}</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">{t('footer.faq')}</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">{t('footer.contact')}</Link></li>
            </ul>
          </div>

          {/* Legal / Information */}
          <div>
            <h4 className="font-heading font-bold mb-4">{t('footer.information')}</h4>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li><Link to="/terms" className="hover:text-white transition-colors">{t('footer.terms')}</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">{t('footer.privacy')}</Link></li>
              <li>
                <button
                  type="button"
                  onClick={openCookieConsent}
                  className="text-right hover:text-white transition-colors"
                >
                  {t('footer.manageCookies')}
                </button>
              </li>
              <li><Link to="/contact" className="hover:text-white transition-colors">{t('footer.contact')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 text-white/60 text-sm text-center">
          © {currentYear} {t('app.name')}. {t('footer.allRights')}
        </div>
      </div>
    </footer>
  )
}

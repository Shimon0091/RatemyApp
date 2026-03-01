import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Icon from './icons'

export default function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center shadow-medium">
                <Icon.Dragon className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{t('app.name')}</h2>
                <p className="text-gray-400 text-sm">{t('app.tagline')}</p>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              {t('footer.description')}
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Icon.ArrowRight className="w-5 h-5 text-primary-400" />
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <Icon.Home className="w-4 h-4 text-gray-600 group-hover:text-primary-400 transition-colors" />
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <Icon.Search className="w-4 h-4 text-gray-600 group-hover:text-primary-400 transition-colors" />
                  {t('footer.searchProperties')}
                </Link>
              </li>
              <li>
                <Link to="/write-review" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <Icon.Edit className="w-4 h-4 text-gray-600 group-hover:text-primary-400 transition-colors" />
                  {t('nav.writeReview')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <Icon.User className="w-4 h-4 text-gray-600 group-hover:text-primary-400 transition-colors" />
                  {t('nav.login')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Icon.FileText className="w-5 h-5 text-primary-400" />
              {t('footer.information')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <Icon.FileCheck className="w-4 h-4 text-gray-600 group-hover:text-primary-400 transition-colors" />
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <Icon.Lock className="w-4 h-4 text-gray-600 group-hover:text-primary-400 transition-colors" />
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <Icon.MessageCircle className="w-4 h-4 text-gray-600 group-hover:text-primary-400 transition-colors" />
                  {t('footer.contact')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <Icon.Alert className="w-4 h-4 text-gray-600 group-hover:text-primary-400 transition-colors" />
                  {t('footer.faq')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} {t('app.name')}. {t('footer.allRights')}
          </p>
          <p className="text-gray-500 text-xs mt-2 flex items-center justify-center gap-1">
            <Icon.Heart className="w-4 h-4 text-red-400" />
            {t('footer.builtWith')}
          </p>
        </div>
      </div>
    </footer>
  )
}

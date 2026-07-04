import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { LineSearch, LineArrowLeft, LineBuilding } from '../components/icons/line'

export default function NotFoundPage() {
  return (
    <div className="bg-canvas text-ink font-body min-h-screen flex flex-col overflow-x-hidden">
      <Seo title="הדף לא נמצא - דירגון" noindex />
      <Header />

      <main id="main-content" className="flex-1 grid place-items-center px-5 py-16 lg:py-24">
        <div className="w-full max-w-md text-center">
          <span className="mx-auto grid place-items-center w-20 h-20 rounded-3xl bg-petrol text-white shadow-lift">
            <LineBuilding width="38" height="38" />
          </span>
          <p className="mt-8 font-heading font-black text-6xl text-petrol">404</p>
          <h1 className="mt-2 font-heading font-bold text-2xl text-ink">העמוד לא נמצא</h1>
          <p className="mt-3 text-muted leading-relaxed">
            הדף שחיפשת לא קיים או שהועבר למקום אחר.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="btn inline-flex items-center justify-center gap-2 rounded-xl bg-amber-cta text-white px-6 py-3 font-bold shadow-[0_10px_24px_-10px_rgba(224,152,46,0.8)] hover:bg-amber-600"
            >
              חזרה לדף הבית
              <LineArrowLeft width="18" height="18" />
            </Link>
            <Link
              to="/search"
              className="btn inline-flex items-center justify-center gap-2 rounded-xl border border-petrol/25 text-petrol px-6 py-3 font-semibold hover:bg-petrol-50"
            >
              <LineSearch width="18" height="18" /> חיפוש דירות
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

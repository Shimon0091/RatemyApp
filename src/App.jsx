import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { LoadingSpinner } from './components/ui/LoadingSpinner'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'))
const PropertyPage = lazy(() => import('./pages/PropertyPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const WriteReviewPage = lazy(() => import('./pages/WriteReviewPage'))
const EditReviewPage = lazy(() => import('./pages/EditReviewPage'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const MyReviewsPage = lazy(() => import('./pages/MyReviewsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const FaqPage = lazy(() => import('./pages/FaqPage'))

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="text-gray-600 mt-4">Loading...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/property/:id" element={<PropertyPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/write-review" element={<WriteReviewPage />} />
            <Route path="/edit-review/:id" element={<EditReviewPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/my-reviews" element={<MyReviewsPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App



import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Icon from '../components/icons'
import { Button } from '../components/ui/Button'
import { Card, CardBody } from '../components/ui/Card'

export default function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Header />
      <main className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="shadow-soft">
          <CardBody className="text-center py-16">
            <div className="bg-primary-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon.Search className="w-12 h-12 text-primary-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              העמוד לא נמצא
            </h2>
            <p className="text-gray-600 mb-8">
              הדף שחיפשת לא קיים או שהועבר למקום אחר.
            </p>
            <Link to="/">
              <Button size="lg">
                <Icon.Home />
                חזרה לדף הבית
              </Button>
            </Link>
          </CardBody>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

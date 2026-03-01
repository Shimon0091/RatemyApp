import Header from '../components/Header'
import Footer from '../components/Footer'
import Icon from '../components/icons'
import { Card, CardBody } from '../components/ui/Card'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-soft">
          <CardBody className="p-8 md:p-12 text-center">
            <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon.Message className="w-10 h-10 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">צור קשר</h1>
            <p className="text-gray-600 mb-8 text-lg">
              יש לך שאלה, הצעה, או בעיה? נשמח לשמוע ממך!
            </p>

            <div className="space-y-4 text-right" dir="rtl">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Icon.Message className="w-5 h-5 text-primary-500" />
                  <h3 className="font-bold text-gray-900">אימייל</h3>
                </div>
                <a
                  href="mailto:shimon@frame-5.com"
                  className="text-primary-600 hover:text-primary-700 font-medium text-lg"
                >
                  shimon@frame-5.com
                </a>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Icon.Flag className="w-5 h-5 text-primary-500" />
                  <h3 className="font-bold text-gray-900">דיווח על ביקורת בעייתית</h3>
                </div>
                <p className="text-gray-600">
                  ניתן לדווח ישירות מעמוד הביקורת באמצעות כפתור "דווח".
                  צוות המודרציה שלנו יבחן כל דיווח.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Icon.Clock className="w-5 h-5 text-primary-500" />
                  <h3 className="font-bold text-gray-900">זמני תגובה</h3>
                </div>
                <p className="text-gray-600">
                  אנו משתדלים להגיב תוך 48 שעות בימי עבודה.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

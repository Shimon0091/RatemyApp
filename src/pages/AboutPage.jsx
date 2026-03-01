import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Icon from '../components/icons'
import { Card, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-soft">
          <CardBody className="p-8 md:p-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">אודות דירגון</h1>

            <div className="prose prose-lg max-w-none text-gray-700 space-y-6" dir="rtl">
              <section>
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">מה זה דירגון?</h2>
                <p>
                  דירגון היא פלטפורמה חינמית לדירוג וביקורת דירות שכורות בישראל.
                  המטרה שלנו פשוטה: לעזור לשוכרים לקבל החלטות מושכלות לפני שהם חותמים על חוזה שכירות.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">למה הקמנו את דירגון?</h2>
                <p>
                  כשוכרים בעצמנו, נתקלנו בבעיה חוזרת: אין דרך לדעת מה באמת מחכה לך בדירה חדשה.
                  האם בעל הבית מגיב? האם התחזוקה טובה? האם הפיקדון יוחזר?
                </p>
                <p>
                  דירגון נולד כדי ליצור שקיפות בשוק השכירות ולתת לשוכרים כלי אמיתי לקבלת החלטות.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">איך זה עובד?</h2>
                <ul className="list-disc pr-6 space-y-2">
                  <li><strong>חפש דירה:</strong> הזן כתובת וראה ביקורות של שוכרים קודמים.</li>
                  <li><strong>כתוב ביקורת:</strong> גרת בדירה? שתף את החוויה שלך ועזור לאחרים.</li>
                  <li><strong>אנונימיות:</strong> הביקורות מוצגות ללא פרטים מזהים של הכותב.</li>
                  <li><strong>מודרציה:</strong> כל ביקורת עוברת בדיקה לפני פרסום כדי להבטיח תוכן אמין.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">העקרונות שלנו</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-primary-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-1">שקיפות</h3>
                    <p className="text-sm text-gray-600">מידע אמיתי מהשטח, ללא פילטרים.</p>
                  </div>
                  <div className="bg-primary-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-1">אנונימיות</h3>
                    <p className="text-sm text-gray-600">הזהות שלך נשמרת בכל מקרה.</p>
                  </div>
                  <div className="bg-primary-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-1">חינם</h3>
                    <p className="text-sm text-gray-600">ללא עלות, ללא כרטיס אשראי, לתמיד.</p>
                  </div>
                  <div className="bg-primary-50 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-1">עצמאות</h3>
                    <p className="text-sm text-gray-600">לא שייך למתווכים או לבעלי דירות.</p>
                  </div>
                </div>
              </section>

              <div className="flex gap-4 justify-center mt-8 pt-8 border-t border-gray-200">
                <Link to="/search">
                  <Button size="lg">
                    <Icon.Search />
                    חפש דירה
                  </Button>
                </Link>
                <Link to="/write-review">
                  <Button variant="secondary" size="lg">
                    <Icon.Edit />
                    כתוב ביקורת
                  </Button>
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

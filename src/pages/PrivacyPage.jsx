import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Card, CardBody } from '../components/ui/Card'

export default function PrivacyPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-soft">
          <CardBody className="p-8 md:p-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">מדיניות פרטיות</h1>
            <p className="text-gray-500 mb-8">עדכון אחרון: מרץ 2026</p>

            <div className="prose prose-lg max-w-none text-gray-700 space-y-6" dir="rtl">
              <section>
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">1. כללי</h2>
                <p>
                  דירגון (להלן: "אנחנו" או "השירות") מחויבת לשמירה על פרטיות המשתמשים שלנו.
                  מדיניות זו מסבירה אילו נתונים אנו אוספים, כיצד אנו משתמשים בהם, וכיצד אנו מגנים עליהם.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. מידע שאנו אוספים</h2>
                <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">מידע שנמסר על ידך:</h3>
                <ul className="list-disc pr-6 space-y-2">
                  <li><strong>פרטי הרשמה:</strong> כתובת אימייל, שם מלא, תמונת פרופיל (בהרשמה דרך Google).</li>
                  <li><strong>ביקורות:</strong> תוכן הביקורת, דירוגים, תקופת שכירות, גובה שכר דירה.</li>
                  <li><strong>כתובות דירות:</strong> רחוב, מספר בניין, קומה, דירה, עיר.</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">מידע שנאסף אוטומטית:</h3>
                <ul className="list-disc pr-6 space-y-2">
                  <li><strong>נתוני שימוש:</strong> עמודים שנצפו, פעולות באתר.</li>
                  <li><strong>נתונים טכניים:</strong> כתובת IP, סוג דפדפן, מערכת הפעלה.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. כיצד אנו משתמשים במידע</h2>
                <ul className="list-disc pr-6 space-y-2">
                  <li>ניהול חשבון המשתמש ואימות זהות.</li>
                  <li>הצגת ביקורות ודירוגים באתר.</li>
                  <li>מודרציה של תוכן ומניעת שימוש לרעה.</li>
                  <li>שיפור השירות וחוויית המשתמש.</li>
                  <li>תקשורת עם המשתמש בנושאים הקשורים לחשבונו.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. שירותי צד שלישי</h2>
                <p>אנו משתמשים בשירותי צד שלישי לתפעול האתר:</p>
                <ul className="list-disc pr-6 space-y-2">
                  <li><strong>Supabase:</strong> אחסון מסד נתונים ואימות משתמשים. הנתונים מאוחסנים בשרתים מאובטחים.</li>
                  <li><strong>Google:</strong> שירות אימות (Google Sign-In) ושירות כתובות (Google Places API) לצורך השלמה אוטומטית של כתובות.</li>
                  <li><strong>Vercel:</strong> אירוח האתר והגשת תוכן.</li>
                </ul>
                <p className="mt-3">
                  לכל שירות צד שלישי יש מדיניות פרטיות משלו. אנו ממליצים לעיין בהן.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">5. שמירה על המידע</h2>
                <p>
                  אנו נוקטים באמצעי אבטחה סבירים לשמירה על המידע, כולל:
                </p>
                <ul className="list-disc pr-6 space-y-2">
                  <li>הצפנת תקשורת באמצעות HTTPS.</li>
                  <li>הגבלת גישה למסד הנתונים באמצעות מדיניות Row Level Security.</li>
                  <li>אחסון סיסמאות בצורה מוצפנת (באמצעות Supabase Auth).</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">6. הזכויות שלך</h2>
                <p>יש לך את הזכויות הבאות בנוגע למידע שלך:</p>
                <ul className="list-disc pr-6 space-y-2">
                  <li><strong>עיון:</strong> זכות לדעת אילו נתונים אנו מחזיקים עליך.</li>
                  <li><strong>תיקון:</strong> זכות לתקן מידע שגוי.</li>
                  <li><strong>מחיקה:</strong> זכות לבקש מחיקת החשבון והנתונים שלך.</li>
                  <li><strong>עריכה:</strong> זכות לערוך או למחוק ביקורות שכתבת.</li>
                </ul>
                <p className="mt-3">
                  למימוש זכויותיך, ניתן לפנות אלינו בכתובת: shimon@frame-5.com
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">7. עוגיות (Cookies)</h2>
                <p>
                  האתר משתמש בעוגיות לצורך ניהול סשן משתמש ושמירת העדפות.
                  עוגיות אלה הכרחיות לתפעול השירות ואינן משמשות למעקב פרסומי.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">8. גיל מינימלי</h2>
                <p>
                  השירות מיועד למשתמשים מעל גיל 18. איננו אוספים ביודעין מידע ממשתמשים מתחת לגיל 18.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">9. שינויים במדיניות</h2>
                <p>
                  אנו עשויים לעדכן מדיניות זו מעת לעת. שינויים מהותיים יפורסמו באתר.
                  תאריך העדכון האחרון מופיע בראש הדף.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">10. יצירת קשר</h2>
                <p>
                  לשאלות בנוגע למדיניות הפרטיות או לבקשות הקשורות למידע שלך, ניתן לפנות אלינו בכתובת: shimon@frame-5.com
                </p>
              </section>
            </div>
          </CardBody>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

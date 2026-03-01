import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Card, CardBody } from '../components/ui/Card'

export default function TermsPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-soft">
          <CardBody className="p-8 md:p-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">תנאי שימוש</h1>
            <p className="text-gray-500 mb-8">עדכון אחרון: מרץ 2026</p>

            <div className="prose prose-lg max-w-none text-gray-700 space-y-6" dir="rtl">
              <section>
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">1. כללי</h2>
                <p>
                  ברוכים הבאים לדירגון (להלן: "האתר" או "השירות"). השירות מופעל על ידי דירגון (להלן: "אנחנו" או "החברה").
                  השימוש באתר מהווה הסכמה לתנאי שימוש אלה. אם אינך מסכים לתנאים, אנא הימנע משימוש באתר.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. תיאור השירות</h2>
                <p>
                  דירגון הינה פלטפורמה לדירוג וביקורת דירות שכורות בישראל. השירות מאפשר למשתמשים לכתוב ביקורות על דירות בהן התגוררו,
                  לחפש ביקורות על דירות, ולדרג את חווית השכירות שלהם.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. הרשמה וחשבון משתמש</h2>
                <ul className="list-disc pr-6 space-y-2">
                  <li>ניתן להירשם באמצעות חשבון Google או כתובת אימייל וסיסמה.</li>
                  <li>עליך לספק מידע מדויק ועדכני בעת ההרשמה.</li>
                  <li>אתה אחראי לשמירת סודיות פרטי החשבון שלך.</li>
                  <li>אנו שומרים את הזכות לבטל חשבונות שמפרים את תנאי השימוש.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. תוכן משתמשים (ביקורות)</h2>
                <p>בכתיבת ביקורת באתר, אתה מתחייב כי:</p>
                <ul className="list-disc pr-6 space-y-2">
                  <li>הביקורת מבוססת על חוויה אישית אמיתית של מגורים בדירה.</li>
                  <li>התוכן אינו כוזב, מטעה, משמיץ, או פוגעני.</li>
                  <li>הביקורת אינה מכילה מידע אישי מזהה של צדדים שלישיים (מספרי טלפון, כתובות מייל וכו').</li>
                  <li>התוכן אינו מפר זכויות קניין רוחני של אחרים.</li>
                  <li>התוכן אינו מכיל ספאם, פרסומות, או תוכן מסחרי.</li>
                </ul>
                <p className="mt-3">
                  אנו שומרים את הזכות להסיר, לערוך או לסרב לפרסם ביקורות שמפרות תנאים אלה, על פי שיקול דעתנו הבלעדי.
                  כל ביקורת עוברת תהליך אישור לפני פרסומה באתר.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">5. אחריות על תוכן</h2>
                <p>
                  הביקורות באתר נכתבות על ידי המשתמשים ומשקפות את דעותיהם האישיות בלבד.
                  דירגון אינה אחראית לתוכן הביקורות, לדיוקן, או לכל נזק שעלול להיגרם כתוצאה מהסתמכות עליהן.
                  אנו לא מאמתים את זהות המשתמשים מעבר לתהליך ההרשמה ואיננו אחראים לנכונות הטענות בביקורות.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">6. דיווח על תוכן בעייתי</h2>
                <p>
                  אם נתקלת בביקורת שמכילה תוכן פוגעני, כוזב, או מפר, ניתן לדווח עליה באמצעות כפתור הדיווח בעמוד הביקורת.
                  אנו מתחייבים לבחון כל דיווח ולפעול בהתאם.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">7. קניין רוחני</h2>
                <p>
                  כל הזכויות בעיצוב האתר, הלוגו, הקוד והתוכן (למעט תוכן משתמשים) שייכות לדירגון.
                  בכתיבת ביקורת, אתה מעניק לנו רישיון לא בלעדי להציג את הביקורת באתר.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">8. הגבלת אחריות</h2>
                <p>
                  השירות ניתן "כמו שהוא" (AS IS) ללא אחריות מכל סוג.
                  דירגון לא תהיה אחראית לכל נזק ישיר, עקיף, מקרי או תוצאתי הנובע משימוש באתר או מהסתמכות על תוכן המוצג בו.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">9. שינויים בתנאי השימוש</h2>
                <p>
                  אנו רשאים לעדכן תנאי שימוש אלה מעת לעת. שינויים מהותיים יפורסמו באתר.
                  המשך השימוש באתר לאחר עדכון התנאים מהווה הסכמה לתנאים המעודכנים.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">10. יצירת קשר</h2>
                <p>
                  לשאלות בנוגע לתנאי השימוש, ניתן לפנות אלינו בכתובת: shimon@frame-5.com
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

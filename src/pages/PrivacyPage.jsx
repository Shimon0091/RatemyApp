import Header from '../components/Header'
import Footer from '../components/Footer'
import PageHero from '../components/PageHero'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { LineLock } from '../components/icons/line'

function Section({ title, children }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="font-heading font-bold text-xl text-ink mb-3">{title}</h2>
      <div className="space-y-3 text-muted leading-relaxed">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  useScrollReveal([])

  return (
    <div className="bg-canvas text-ink font-body min-h-screen flex flex-col overflow-x-hidden">
      <Header />

      <PageHero
        icon={LineLock}
        title="מדיניות פרטיות"
        subtitle="איך אנחנו אוספים, משתמשים ומגנים על המידע שלך."
        meta="עדכון אחרון: מרץ 2026"
      />

      <main id="main-content" className="flex-1">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 -mt-8 lg:-mt-12 pb-20">
          <div className="reveal bg-white rounded-2xl shadow-card border border-black/5 p-8 lg:p-12" dir="rtl">
            <Section title="1. כללי">
              <p>
                דירגון (להלן: "אנחנו" או "השירות") מחויבת לשמירה על פרטיות המשתמשים שלנו.
                מדיניות זו מסבירה אילו נתונים אנו אוספים, כיצד אנו משתמשים בהם, וכיצד אנו מגנים עליהם.
              </p>
            </Section>

            <Section title="2. מידע שאנו אוספים">
              <h3 className="font-heading font-semibold text-ink">מידע שנמסר על ידך:</h3>
              <ul className="list-disc pr-6 space-y-2">
                <li><strong className="text-ink font-semibold">פרטי הרשמה:</strong> כתובת אימייל, שם מלא, תמונת פרופיל (בהרשמה דרך Google).</li>
                <li><strong className="text-ink font-semibold">ביקורות:</strong> תוכן הביקורת, דירוגים, תקופת שכירות, גובה שכר דירה.</li>
                <li><strong className="text-ink font-semibold">כתובות דירות:</strong> רחוב, מספר בניין, קומה, דירה, עיר.</li>
              </ul>
              <h3 className="font-heading font-semibold text-ink pt-2">מידע שנאסף אוטומטית:</h3>
              <ul className="list-disc pr-6 space-y-2">
                <li><strong className="text-ink font-semibold">נתוני שימוש:</strong> עמודים שנצפו, פעולות באתר.</li>
                <li><strong className="text-ink font-semibold">נתונים טכניים:</strong> כתובת IP, סוג דפדפן, מערכת הפעלה.</li>
              </ul>
            </Section>

            <Section title="3. כיצד אנו משתמשים במידע">
              <ul className="list-disc pr-6 space-y-2">
                <li>ניהול חשבון המשתמש ואימות זהות.</li>
                <li>הצגת ביקורות ודירוגים באתר.</li>
                <li>מודרציה של תוכן ומניעת שימוש לרעה.</li>
                <li>שיפור השירות וחוויית המשתמש.</li>
                <li>תקשורת עם המשתמש בנושאים הקשורים לחשבונו.</li>
              </ul>
            </Section>

            <Section title="4. שירותי צד שלישי">
              <p>אנו משתמשים בשירותי צד שלישי לתפעול האתר:</p>
              <ul className="list-disc pr-6 space-y-2">
                <li><strong className="text-ink font-semibold">Supabase:</strong> אחסון מסד נתונים ואימות משתמשים. הנתונים מאוחסנים בשרתים מאובטחים.</li>
                <li><strong className="text-ink font-semibold">Google:</strong> שירות אימות (Google Sign-In) ושירות כתובות (Google Places API) לצורך השלמה אוטומטית של כתובות.</li>
                <li><strong className="text-ink font-semibold">Vercel:</strong> אירוח האתר והגשת תוכן.</li>
              </ul>
              <p>לכל שירות צד שלישי יש מדיניות פרטיות משלו. אנו ממליצים לעיין בהן.</p>
            </Section>

            <Section title="5. שמירה על המידע">
              <p>אנו נוקטים באמצעי אבטחה סבירים לשמירה על המידע, כולל:</p>
              <ul className="list-disc pr-6 space-y-2">
                <li>הצפנת תקשורת באמצעות HTTPS.</li>
                <li>הגבלת גישה למסד הנתונים באמצעות מדיניות Row Level Security.</li>
                <li>אחסון סיסמאות בצורה מוצפנת (באמצעות Supabase Auth).</li>
              </ul>
            </Section>

            <Section title="6. הזכויות שלך">
              <p>יש לך את הזכויות הבאות בנוגע למידע שלך:</p>
              <ul className="list-disc pr-6 space-y-2">
                <li><strong className="text-ink font-semibold">עיון:</strong> זכות לדעת אילו נתונים אנו מחזיקים עליך.</li>
                <li><strong className="text-ink font-semibold">תיקון:</strong> זכות לתקן מידע שגוי.</li>
                <li><strong className="text-ink font-semibold">מחיקה:</strong> זכות לבקש מחיקת החשבון והנתונים שלך.</li>
                <li><strong className="text-ink font-semibold">עריכה:</strong> זכות לערוך או למחוק ביקורות שכתבת.</li>
              </ul>
              <p>למימוש זכויותיך, ניתן לפנות אלינו בכתובת: shimon@frame-5.com</p>
            </Section>

            <Section title="7. עוגיות (Cookies)">
              <p>
                האתר משתמש בעוגיות לצורך ניהול סשן משתמש ושמירת העדפות.
                עוגיות אלה הכרחיות לתפעול השירות ואינן משמשות למעקב פרסומי.
              </p>
            </Section>

            <Section title="8. גיל מינימלי">
              <p>
                השירות מיועד למשתמשים מעל גיל 18. איננו אוספים ביודעין מידע ממשתמשים מתחת לגיל 18.
              </p>
            </Section>

            <Section title="9. שינויים במדיניות">
              <p>
                אנו עשויים לעדכן מדיניות זו מעת לעת. שינויים מהותיים יפורסמו באתר.
                תאריך העדכון האחרון מופיע בראש הדף.
              </p>
            </Section>

            <Section title="10. יצירת קשר">
              <p>
                לשאלות בנוגע למדיניות הפרטיות או לבקשות הקשורות למידע שלך, ניתן לפנות אלינו בכתובת: shimon@frame-5.com
              </p>
            </Section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

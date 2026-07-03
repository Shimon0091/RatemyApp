import Header from '../components/Header'
import Footer from '../components/Footer'
import PageHero from '../components/PageHero'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { LineDoc } from '../components/icons/line'

function Section({ title, children }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="font-heading font-bold text-xl text-ink mb-3">{title}</h2>
      <div className="space-y-3 text-muted leading-relaxed">{children}</div>
    </section>
  )
}

export default function TermsPage() {
  useScrollReveal([])

  return (
    <div className="bg-canvas text-ink font-body min-h-screen flex flex-col overflow-x-hidden">
      <Header />

      <PageHero
        icon={LineDoc}
        title="תנאי שימוש"
        subtitle="הכללים שמסדירים את השימוש בדירגון."
        meta="עדכון אחרון: מרץ 2026"
      />

      <main id="main-content" className="flex-1">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 -mt-8 lg:-mt-12 pb-20">
          <div className="reveal bg-white rounded-2xl shadow-card border border-black/5 p-8 lg:p-12" dir="rtl">
            <Section title="1. כללי">
              <p>
                ברוכים הבאים לדירגון (להלן: "האתר" או "השירות"). השירות מופעל על ידי דירגון (להלן: "אנחנו" או "החברה").
                השימוש באתר מהווה הסכמה לתנאי שימוש אלה. אם אינך מסכים לתנאים, אנא הימנע משימוש באתר.
              </p>
            </Section>

            <Section title="2. תיאור השירות">
              <p>
                דירגון הינה פלטפורמה לדירוג וביקורת דירות שכורות בישראל. השירות מאפשר למשתמשים לכתוב ביקורות על דירות בהן התגוררו,
                לחפש ביקורות על דירות, ולדרג את חווית השכירות שלהם.
              </p>
            </Section>

            <Section title="3. הרשמה וחשבון משתמש">
              <ul className="list-disc pr-6 space-y-2">
                <li>ניתן להירשם באמצעות חשבון Google או כתובת אימייל וסיסמה.</li>
                <li>עליך לספק מידע מדויק ועדכני בעת ההרשמה.</li>
                <li>אתה אחראי לשמירת סודיות פרטי החשבון שלך.</li>
                <li>אנו שומרים את הזכות לבטל חשבונות שמפרים את תנאי השימוש.</li>
              </ul>
            </Section>

            <Section title="4. תוכן משתמשים (ביקורות)">
              <p>בכתיבת ביקורת באתר, אתה מתחייב כי:</p>
              <ul className="list-disc pr-6 space-y-2">
                <li>הביקורת מבוססת על חוויה אישית אמיתית של מגורים בדירה.</li>
                <li>התוכן אינו כוזב, מטעה, משמיץ, או פוגעני.</li>
                <li>הביקורת אינה מכילה מידע אישי מזהה של צדדים שלישיים (מספרי טלפון, כתובות מייל וכו').</li>
                <li>התוכן אינו מפר זכויות קניין רוחני של אחרים.</li>
                <li>התוכן אינו מכיל ספאם, פרסומות, או תוכן מסחרי.</li>
              </ul>
              <p>
                אנו שומרים את הזכות להסיר, לערוך או לסרב לפרסם ביקורות שמפרות תנאים אלה, על פי שיקול דעתנו הבלעדי.
                כל ביקורת עוברת תהליך אישור לפני פרסומה באתר.
              </p>
            </Section>

            <Section title="5. אחריות על תוכן">
              <p>
                הביקורות באתר נכתבות על ידי המשתמשים ומשקפות את דעותיהם האישיות בלבד.
                דירגון אינה אחראית לתוכן הביקורות, לדיוקן, או לכל נזק שעלול להיגרם כתוצאה מהסתמכות עליהן.
                אנו לא מאמתים את זהות המשתמשים מעבר לתהליך ההרשמה ואיננו אחראים לנכונות הטענות בביקורות.
              </p>
            </Section>

            <Section title="6. דיווח על תוכן בעייתי">
              <p>
                אם נתקלת בביקורת שמכילה תוכן פוגעני, כוזב, או מפר, ניתן לדווח עליה באמצעות כפתור הדיווח בעמוד הביקורת.
                אנו מתחייבים לבחון כל דיווח ולפעול בהתאם.
              </p>
            </Section>

            <Section title="7. קניין רוחני">
              <p>
                כל הזכויות בעיצוב האתר, הלוגו, הקוד והתוכן (למעט תוכן משתמשים) שייכות לדירגון.
                בכתיבת ביקורת, אתה מעניק לנו רישיון לא בלעדי להציג את הביקורת באתר.
              </p>
            </Section>

            <Section title="8. הגבלת אחריות">
              <p>
                השירות ניתן "כמו שהוא" (AS IS) ללא אחריות מכל סוג.
                דירגון לא תהיה אחראית לכל נזק ישיר, עקיף, מקרי או תוצאתי הנובע משימוש באתר או מהסתמכות על תוכן המוצג בו.
              </p>
            </Section>

            <Section title="9. שינויים בתנאי השימוש">
              <p>
                אנו רשאים לעדכן תנאי שימוש אלה מעת לעת. שינויים מהותיים יפורסמו באתר.
                המשך השימוש באתר לאחר עדכון התנאים מהווה הסכמה לתנאים המעודכנים.
              </p>
            </Section>

            <Section title="10. יצירת קשר">
              <p>
                לשאלות בנוגע לתנאי השימוש, ניתן לפנות אלינו בכתובת: shimon@frame-5.com
              </p>
            </Section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

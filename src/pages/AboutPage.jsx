import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PageHero from '../components/PageHero'
import { useScrollReveal } from '../hooks/useScrollReveal'
import {
  LineBadgeCheck, LineSearch, LineEdit, LineArrowLeft,
  LineHeart, LineUser, LineShekel, LineBuilding,
} from '../components/icons/line'

const principles = [
  { Icon: LineBadgeCheck, title: 'שקיפות', text: 'מידע אמיתי מהשטח, ללא פילטרים.' },
  { Icon: LineUser, title: 'אנונימיות', text: 'הזהות שלך נשמרת בכל מקרה.' },
  { Icon: LineHeart, title: 'חינם', text: 'ללא עלות, ללא כרטיס אשראי, לתמיד.' },
  { Icon: LineBuilding, title: 'עצמאות', text: 'לא שייך למתווכים או לבעלי דירות.' },
]

const steps = [
  { title: 'חפשו דירה', text: 'הזינו כתובת וראו ביקורות של שוכרים קודמים.' },
  { title: 'כתבו ביקורת', text: 'גרתם בדירה? שתפו את החוויה שלכם ועזרו לאחרים.' },
  { title: 'אנונימיות', text: 'הביקורות מוצגות ללא פרטים מזהים של הכותב.' },
  { title: 'מודרציה', text: 'כל ביקורת עוברת בדיקה לפני פרסום להבטחת תוכן אמין.' },
]

export default function AboutPage() {
  useScrollReveal([])

  return (
    <div className="bg-canvas text-ink font-body min-h-screen flex flex-col overflow-x-hidden">
      <Header />

      <PageHero
        icon={LineBadgeCheck}
        title="אודות דירגון"
        subtitle="פלטפורמה חינמית לדירוג וביקורת דירות שכורות בישראל — כדי שכל שוכר יוכל להחליט מתוך ידע."
      />

      <main id="main-content" className="flex-1">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 -mt-8 lg:-mt-12 pb-20 space-y-6">
          {/* Intro card */}
          <div className="reveal bg-white rounded-2xl shadow-card border border-black/5 p-8 lg:p-10">
            <h2 className="font-heading font-bold text-2xl text-ink">מה זה דירגון?</h2>
            <p className="mt-3 text-muted leading-relaxed text-lg">
              דירגון היא פלטפורמה חינמית לדירוג וביקורת דירות שכורות בישראל. המטרה שלנו פשוטה:
              לעזור לשוכרים לקבל החלטות מושכלות לפני שהם חותמים על חוזה שכירות.
            </p>
            <h2 className="font-heading font-bold text-2xl text-ink mt-8">למה הקמנו את דירגון?</h2>
            <p className="mt-3 text-muted leading-relaxed">
              כשוכרים בעצמנו, נתקלנו בבעיה חוזרת: אין דרך לדעת מה באמת מחכה לך בדירה חדשה.
              האם בעל הבית מגיב? האם התחזוקה טובה? האם הפיקדון יוחזר?
            </p>
            <p className="mt-3 text-muted leading-relaxed">
              דירגון נולד כדי ליצור שקיפות בשוק השכירות ולתת לשוכרים כלי אמיתי לקבלת החלטות.
            </p>
          </div>

          {/* How it works */}
          <div className="reveal bg-white rounded-2xl shadow-card border border-black/5 p-8 lg:p-10">
            <h2 className="font-heading font-bold text-2xl text-ink mb-6">איך זה עובד?</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {steps.map((step, i) => (
                <div key={step.title} className="flex gap-4">
                  <span className="grid place-items-center shrink-0 w-10 h-10 rounded-xl bg-petrol-50 text-petrol font-heading font-black">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-heading font-bold text-ink">{step.title}</h3>
                    <p className="text-muted text-sm mt-1 leading-relaxed">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Principles */}
          <div className="reveal">
            <h2 className="font-heading font-bold text-2xl text-ink mb-6 text-center">העקרונות שלנו</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {principles.map(({ Icon, title, text }) => (
                <div
                  key={title}
                  className="lift bg-white rounded-2xl shadow-card border border-black/5 p-6 text-center"
                >
                  <span className="mx-auto grid place-items-center w-12 h-12 rounded-xl bg-petrol-50 text-petrol mb-4">
                    <Icon width="24" height="24" />
                  </span>
                  <h3 className="font-heading font-bold text-ink">{title}</h3>
                  <p className="text-muted text-sm mt-1.5 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="reveal bg-petrol rounded-2xl shadow-lift p-8 lg:p-10 text-center text-white">
            <LineShekel className="mx-auto text-amber" width="30" height="30" />
            <h2 className="font-heading font-black text-2xl mt-4">מתחילים?</h2>
            <p className="mt-2 text-white/80">חפשו דירה או שתפו את החוויה שלכם — בחינם ובאנונימיות.</p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/search"
                className="btn inline-flex items-center justify-center gap-2 rounded-xl bg-amber-cta text-white px-6 py-3 font-bold shadow-[0_10px_24px_-10px_rgba(224,152,46,0.8)] hover:bg-amber-600"
              >
                <LineSearch width="18" height="18" /> חפשו דירה
              </Link>
              <Link
                to="/write-review"
                className="btn inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 text-white px-6 py-3 font-bold border border-white/20 hover:bg-white/20"
              >
                <LineEdit width="18" height="18" /> כתבו ביקורת
                <LineArrowLeft width="16" height="16" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

import Seo from '../components/Seo'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PageHero from '../components/PageHero'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { LineChat, LineAlert, LineClock } from '../components/icons/line'

const CONTACT_EMAIL = 'shimon@frame-5.com'

export default function ContactPage() {
  useScrollReveal([])

  const cards = [
    {
      Icon: LineChat,
      title: 'אימייל',
      body: (
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          dir="ltr"
          className="inline-block text-petrol hover:text-petrol-700 font-bold text-lg hover:underline"
        >
          {CONTACT_EMAIL}
        </a>
      ),
    },
    {
      Icon: LineAlert,
      title: 'דיווח על ביקורת בעייתית',
      body: (
        <p className="text-muted leading-relaxed">
          ניתן לדווח ישירות מעמוד הביקורת באמצעות כפתור "דווח". צוות המודרציה שלנו יבחן כל דיווח.
        </p>
      ),
    },
    {
      Icon: LineClock,
      title: 'זמני תגובה',
      body: (
        <p className="text-muted leading-relaxed">
          אנו משתדלים להגיב תוך 48 שעות בימי עבודה.
        </p>
      ),
    },
  ]

  return (
    <div className="bg-canvas text-ink font-body min-h-screen flex flex-col overflow-x-hidden">
      <Seo
        title="צור קשר - דירגון"
        description="יש לכם שאלה, הצעה או דיווח? צרו קשר עם צוות דירגון. אנו משתדלים להגיב תוך 48 שעות בימי עבודה."
      />
      <Header />

      <PageHero
        icon={LineChat}
        title="צור קשר"
        subtitle="יש לך שאלה, הצעה, או בעיה? נשמח לשמוע ממך."
      />

      <main id="main-content" className="flex-1">
        <div className="max-w-2xl mx-auto px-5 lg:px-8 -mt-8 lg:-mt-12 pb-20 space-y-5">
          {cards.map(({ Icon, title, body }) => (
            <div
              key={title}
              className="reveal lift bg-white rounded-2xl shadow-card border border-black/5 p-6 flex gap-4"
            >
              <span className="grid place-items-center shrink-0 w-12 h-12 rounded-xl bg-petrol-50 text-petrol">
                <Icon width="24" height="24" />
              </span>
              <div>
                <h3 className="font-heading font-bold text-ink mb-1.5">{title}</h3>
                {body}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}

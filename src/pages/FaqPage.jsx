import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PageHero from '../components/PageHero'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { LineChat, LineChevronLeft, LineSearch } from '../components/icons/line'

const faqs = [
  {
    question: 'מה זה דירגון?',
    answer: 'דירגון היא פלטפורמה חינמית לדירוג וביקורת דירות שכורות בישראל. המטרה שלנו לעזור לשוכרים לקבל החלטות מושכלות לפני חתימה על חוזה שכירות.'
  },
  {
    question: 'האם הביקורות אנונימיות?',
    answer: 'כן. הביקורות מוצגות באתר ללא שם הכותב או פרטים מזהים. רק צוות המודרציה יכול לראות מי כתב את הביקורת, לצורך מניעת ספאם בלבד.'
  },
  {
    question: 'כמה זה עולה?',
    answer: 'דירגון חינמי לחלוטין — גם לקריאת ביקורות וגם לכתיבת ביקורות. אין עלויות נסתרות ואין צורך בכרטיס אשראי.'
  },
  {
    question: 'למה צריך להתחבר כדי לכתוב ביקורת?',
    answer: 'ההתחברות נדרשת כדי למנוע ביקורות מזויפות וספאם. אנחנו לא מציגים את הפרטים שלך בביקורת — השם שלך נשאר פרטי.'
  },
  {
    question: 'מה קורה אחרי שאני שולח ביקורת?',
    answer: 'הביקורת עוברת בדיקה של צוות המודרציה שלנו. אנחנו מוודאים שהתוכן לא פוגעני, לא מכיל מידע אישי, ולא מפר את תנאי השימוש. התהליך לוקח עד 48 שעות.'
  },
  {
    question: 'האם אני יכול לערוך או למחוק ביקורת?',
    answer: 'כן. אפשר לערוך ביקורות שממתינות לאישור, ולמחוק כל ביקורת שכתבת דרך עמוד הפרופיל שלך. שים לב שביקורת שנערכה תעבור אישור מחדש.'
  },
  {
    question: 'מצאתי ביקורת שקרית/פוגענית. מה עושים?',
    answer: 'ליד כל ביקורת יש כפתור "דווח". לחיצה עליו שולחת דיווח לצוות שלנו. אנחנו בוחנים כל דיווח ומסירים תוכן שמפר את המדיניות שלנו.'
  },
  {
    question: 'האם דירגון שייך לחברת תיווך או לבעלי דירות?',
    answer: 'לא. דירגון הוא פרויקט עצמאי שנבנה על ידי שוכרים, בשביל שוכרים. אנחנו לא מקבלים תשלום מבעלי דירות או מתווכים ולא מקדמים נכסים.'
  }
]

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-black/5 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-right gap-4 group"
        dir="rtl"
        aria-expanded={open}
      >
        <span className="font-heading font-bold text-ink text-lg group-hover:text-petrol transition-colors">
          {question}
        </span>
        <span
          className={`grid place-items-center shrink-0 w-8 h-8 rounded-full bg-canvas text-petrol transition-transform ${open ? '-rotate-90' : ''}`}
        >
          <LineChevronLeft width="16" height="16" />
        </span>
      </button>
      {open && (
        <div className="pb-5 text-muted leading-relaxed animate-slide-down" dir="rtl">
          {answer}
        </div>
      )}
    </div>
  )
}

export default function FaqPage() {
  useScrollReveal([])

  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    }
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(schema)
    document.head.appendChild(script)
    return () => document.head.removeChild(script)
  }, [])

  return (
    <div className="bg-canvas text-ink font-body min-h-screen flex flex-col overflow-x-hidden">
      <Seo
        title="שאלות נפוצות - דירגון"
        description="תשובות לשאלות הנפוצות ביותר על דירגון: איך זה עובד, אנונימיות, עלות, מודרציה ועוד."
      />
      <Header />

      <PageHero
        icon={LineChat}
        title="שאלות נפוצות"
        subtitle="תשובות לשאלות הנפוצות ביותר על דירגון."
      />

      <main id="main-content" className="flex-1">
        <div className="max-w-3xl mx-auto px-5 lg:px-8 -mt-8 lg:-mt-12 pb-16">
          <div className="reveal bg-white rounded-2xl shadow-card border border-black/5 p-6 lg:p-10">
            {faqs.map((faq, index) => (
              <FaqItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>

          <div className="reveal mt-8 text-center">
            <p className="text-muted">לא מצאתם תשובה?</p>
            <Link
              to="/contact"
              className="btn mt-3 inline-flex items-center gap-2 rounded-full bg-white border border-black/5 shadow-sm px-6 py-3 font-semibold text-petrol hover:shadow-card"
            >
              <LineSearch width="16" height="16" /> צרו קשר
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Icon from '../components/icons'
import { Card, CardBody } from '../components/ui/Card'

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
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-right gap-4"
        dir="rtl"
      >
        <span className="font-bold text-gray-900 text-lg">{question}</span>
        <Icon.ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pb-5 text-gray-600 leading-relaxed" dir="rtl">
          {answer}
        </div>
      )}
    </div>
  )
}

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="shadow-soft">
          <CardBody className="p-8 md:p-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">שאלות נפוצות</h1>
            <p className="text-gray-500 mb-8">תשובות לשאלות הנפוצות ביותר על דירגון</p>

            <div>
              {faqs.map((faq, index) => (
                <FaqItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </CardBody>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

# 🐉 דירגון - פלטפורמת דירוג דירות לתל אביב

פלטפורמה לדירוג ושיתוף חוויות של שוכרים דירות בתל אביב, בנויה עם React, Vite, Tailwind CSS, ו-Supabase.

---

## 🌟 תכונות

### **למשתמשים:**
- 🔍 **חיפוש דירות** - מצא דירות לפי כתובת
- ⭐ **דירוגים מפורטים** - דירוג כללי + תחזוקה, תקשורת, תמורה
- 💬 **ביקורות מפורטות** - קרא חוויות אמיתיות של שוכרים
- 📊 **סטטיסטיקות** - החזרת פיקדון, עמידה בחוזה, תיקונים
- ✍️ **כתיבת דירגונים** - שתף את החוויה שלך
- 👍 **הצבעות** - סמן ביקורות מועילות

### **לאדמינים:**
- ⚙️ **לוח בקרה** - מעקב אחר סטטיסטיקות
- ✅ **ניהול ביקורות** - אישור/דחיית ביקורות
- 📈 **דשבורד** - ניתוח נתונים

### **אבטחה:**
- 🔐 **Authentication מלא** - Google, Apple, Email/Password
- 🛡️ **Row Level Security** - הגנה ברמת Database
- ✅ **Moderation** - כל ביקורת נבדקת לפני פרסום

---

## 🏗️ סטאק טכנולוגי

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Deployment:** Netlify (או Vercel)
- **Language:** Hebrew (RTL)

---

## 📦 התקנה מקומית

### דרישות מוקדמות:
- Node.js 18+ 
- npm או yarn
- חשבון Supabase (חינמי)

### שלבי התקנה:

#### 1. שכפל את הפרויקט
```bash
git clone [YOUR_REPO_URL]
cd dirgon
```

#### 2. התקן תלויות
```bash
npm install
```

#### 3. הגדר משתני סביבה

צור קובץ `.env` בשורש הפרויקט:

```env
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**איך לקבל את הערכים:**
1. לך ל-https://supabase.com
2. צור פרויקט חדש
3. לך ל-Settings > API
4. העתק את ה-URL ו-anon key

#### 4. הגדר את ה-Database

1. פתח את Supabase Dashboard
2. לך ל-SQL Editor
3. העתק והרץ את `database_schema.sql`

#### 5. הגדר Authentication Providers

**Google Sign-In (מומלץ):**
1. ב-Supabase: Authentication > Providers > Google > Enable
2. צור Google OAuth Client ב-https://console.cloud.google.com
3. הוסף Redirect URI: `https://[your-project-id].supabase.co/auth/v1/callback`
4. העתק Client ID & Secret ל-Supabase

**Apple Sign-In (אופציונלי):**
1. דורש Apple Developer Account ($99/שנה)
2. עקוב אחר [המדריך של Supabase](https://supabase.com/docs/guides/auth/social-login/auth-apple)

**Email/Password:**
- מופעל אוטומטית ✅

#### 6. הגדר אדמין

ערוך את `src/pages/AdminDashboard.jsx` שורה 26:
```javascript
const adminEmails = [
  'your-email@example.com' // 👈 האימייל שלך!
]
```

ערוך את `src/components/Header.jsx` שורה 11:
```javascript
const isAdmin = user && user.email === 'your-email@example.com' // 👈 האימייל שלך!
```

#### 7. הרץ את הפרויקט
```bash
npm run dev
```

האתר יהיה זמין ב-http://localhost:5173

---

## 🚀 Deployment

### אופציה 1: Netlify (מומלץ)

#### דרך GitHub:

1. **העלה לGitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin [YOUR_REPO_URL]
git push -u origin main
```

2. **חבר ל-Netlify:**
   - לך ל-https://netlify.com
   - לחץ "Add new site" > "Import an existing project"
   - בחר GitHub ואת ה-repository שלך
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - לחץ "Deploy"

3. **הוסף Environment Variables:**
   - Site settings > Environment variables
   - הוסף:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Redeploy

4. **הגדר Custom Domain (אופציונלי):**
   - Site settings > Domain management
   - Add custom domain

### אופציה 2: Vercel

1. התקן Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. הוסף Environment Variables ב-Vercel Dashboard

---

## 📁 מבנה הפרויקט

```
dirgon/
├── src/
│   ├── components/         # קומפוננטות React
│   │   ├── Header.jsx
│   │   ├── SearchBar.jsx
│   │   ├── RatingStars.jsx
│   │   ├── RatingInput.jsx
│   │   └── ReviewCard.jsx
│   ├── pages/             # דפים
│   │   ├── HomePage.jsx
│   │   ├── PropertyPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── WriteReviewPage.jsx
│   │   └── AdminDashboard.jsx
│   ├── contexts/          # Context API
│   │   └── AuthContext.jsx
│   ├── lib/              # פונקציות עזר
│   │   ├── supabase.js
│   │   └── database.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── database_schema.sql    # Database schema
├── .env.example          # תבנית environment variables
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 🗄️ Database Schema

### טבלאות:

#### **properties**
- מידע על דירות (כתובת, דירוגים, סטטיסטיקות)
- דירוגים מחושבים אוטומטית מביקורות

#### **reviews**
- ביקורות משתמשים
- דירוגים (כללי + 3 קטגוריות)
- תגיות, טקסט, תקופת שכירות
- Status: pending/approved/rejected

#### **review_helpfulness**
- הצבעות "מועיל/לא מועיל"
- One vote per user per review

#### **review_reports**
- דיווחים על ביקורות בעייתיות

#### **user_profiles**
- פרופילים משתמשים
- Role (tenant/landlord/admin)

### Triggers:
- **update_property_ratings:** מעדכן דירוגים אוטומטית כשביקורת מאושרת

### Row Level Security (RLS):
- משתמשים יכולים לראות רק ביקורות מאושרות
- משתמשים יכולים לערוך רק ביקורות משלהם
- אדמינים יכולים לנהל הכל

---

## 🔧 Scripts זמינים

```bash
npm run dev          # הרצה מקומית (http://localhost:5173)
npm run build        # בניית פרודקשן
npm run preview      # תצוגה מקדימה של build
npm run lint         # בדיקת קוד
```

---

## 🎯 תכונות עתידיות (רעיונות)

- [ ] חיפוש משופר עם Google Places API
- [ ] פילטרים (שכונה, מחיר, דירוג)
- [ ] מפה אינטראקטיבית
- [ ] מערכת התראות (ביקורת חדשה על דירה שעקבת)
- [ ] שיתוף ברשתות חברתיות
- [ ] ייצוא PDF של ביקורות
- [ ] גרפים וויזואליזציות
- [ ] API ציבורי
- [ ] אפליקציית mobile (React Native)

---

## 🤝 תרומה

רוצה לתרום לפרויקט? מעולה!

1. Fork את הפרויקט
2. צור branch חדש (`git checkout -b feature/AmazingFeature`)
3. Commit את השינויים (`git commit -m 'Add some AmazingFeature'`)
4. Push ל-branch (`git push origin feature/AmazingFeature`)
5. פתח Pull Request

---

## 📝 רישיון

MIT License - ראה קובץ LICENSE לפרטים

---

## 📧 יצירת קשר

יש שאלות? פתח Issue או צור קשר:
- Email: [your-email@example.com]
- GitHub: [@yourusername]

---

## 🙏 תודות

- [Supabase](https://supabase.com) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com) - CSS Framework
- [React](https://react.dev) - UI Library
- [Vite](https://vitejs.dev) - Build Tool

---

**🐉 דירגון - השומר של השוכרים בתל אביב**

Made with ❤️ in Tel Aviv

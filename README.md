# היידה - מערכת ניהול אירועים מוזיקליים

מערכת ניהול מקצועית לחברות אירועים מוזיקליים הכוללת ניהול לידים, אירועים, נגנים, ספקים, מערכת כספים ואינטגרציה עם יומן גוגל ושליחת תזכורות אוטומטיות.

## 🎵 תכונות עיקריות

### 📊 ניהול לידים והזדמנויות
- **לוח קנבן** לניהול לידים לפי סטטוס
- מעקב אחר תהליך המכירה: חדש → יצירת קשר → הצעת מחיר → חוזה → מקדמה → יתרה → נצחון/אבדן
- יצירת הזדמנויות עם פירוט פריטים והצעת מחיר
- המרה אוטומטית מהזדמנות נצחת לאירוע

### 🎪 ניהול אירועים
- **Event Hub** - מרכז ניהול מלא לכל אירוע
- מעקב פיננסי: הכנסות, הוצאות, רווחיות
- **מערכת Settlement** - חישוב וחלוקת רווחים בין השותפים
- שלושה מצבי עסקה: פנימי, קבלן מנוהל, הפניה בלבד
- ניהול צוות נגנים עם מניעת double-booking אוטומטית

### 💰 מערכת כספים (Treasury)
- **ארנקים דיגיטליים** לשותפים וקופה קטנה
- מעקב אוטומטי על תנועות כספים
- העברות בין חשבונות
- קישור אוטומטי של הכנסות והוצאות לתנועות כספיות
- דוחות יתרות ותנועות

### 👨‍🎤 ניהול נגנים וספקים
- מאגר נגנים עם פרטים, תפקידים וטווח שכר
- **מניעת double-booking** - בלימה אוטומטית של שיוך נגן לאירועים חופפים
- מאגר ספקים (להקות, סאונד, תאורה וכו')
- ניהול חוזים עם ספקים

### 📧 אוטומציה וחכמה
- **תזכורות אוטומטיות לנגנים** - 24 שעות ו-3 שעות לפני האירוע
- שליחת אימיילים בעברית עם כל הפרטים הרלוונטיים
- **אינטגרציה עם יומן גוגל** - יצירת אירועים עם הזמנות לנגנים
- מניעת שליחה כפולה עם מערכת deduplication

### 🏦 מערכת חלוקת רווחים
- שלושה סוגי מדיניות: אחוזים, סכום קבוע, מעורב
- **רצפת Fund** - הבטחת מינימום לקופת החברה
- נעילת settlements למניעת שינויים

## 🛠️ טכנולוגיות

- **Next.js 15** עם App Router ו-Server Actions
- **React 19** לממשק המשתמש
- **TypeScript** לבטיחות סוגים
- **Prisma** עם SQLite למסד נתונים
- **Tailwind CSS** לעיצוב RTL
- **Day.js** לטיפול בזמנים (Asia/Jerusalem)
- **Zod** לוולידציה
- **Nodemailer** לשליחת אימיילים
- **Google Calendar API** לאינטגרציה עם יומן

## 🚀 התקנה והרצה

### דרישות מקדימות
- Node.js 18+ 
- npm או yarn
- חשבון Gmail עם App Password (לשליחת מיילים)
- Google Service Account (לאינטגרציה עם Calendar)

### 1. שכפול הפרויקט
```bash
git clone https://github.com/your-repo/heyda.git
cd heyda
```

### 2. התקנת חבילות
```bash
npm install
```

### 3. הגדרת משתני סביבה
העתק את `.env.example` ל-`.env` ועדכן את הערכים:

```bash
cp .env.example .env
```

ערוך את `.env`:
```env
DATABASE_URL="file:./prisma/dev.db"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
TZ="Asia/Jerusalem"

# הגדרות SMTP (Gmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"
SMTP_FROM="\"היידה\" <no-reply@heyda.example>"

# Google Calendar API
GOOGLE_SERVICE_ACCOUNT_EMAIL="sa@project.iam.gserviceaccount.com"
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
CALENDAR_ID="your_calendar@gmail.com"
```

### 4. הגדרת מסד הנתונים
```bash
# יצירת מסד הנתונים וטבלאות
npx prisma db push

# יצירת נתוני דוגמה
npm run db:seed
```

### 5. הרצת הפרויקט
```bash
npm run dev
```

האתר יהיה זמין בכתובת: http://localhost:3000

## 🔧 הגדרות נוספות

### הגדרת Gmail App Password
1. עבור להגדרות חשבון Google
2. הפעל 2-Factor Authentication
3. צור App Password ספציפי למערכת
4. השתמש בסיסמה זו ב-`SMTP_PASS`

### הגדרת Google Service Account
1. עבור ל-[Google Cloud Console](https://console.cloud.google.com/)
2. צור פרויקט חדש או בחר קיים
3. הפעל את Calendar API
4. צור Service Account
5. הורד את ה-JSON key
6. העתק את `client_email` ל-`GOOGLE_SERVICE_ACCOUNT_EMAIL`  
7. העתק את `private_key` ל-`GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
8. **שתף את היומן** עם Service Account (Give calendar access)

### הגדרת Cron Jobs

#### Vercel (Production)
הקובץ `vercel.json` כבר מוכן:
```json
{
  "crons": [
    {
      "path": "/api/cron/send-musician-reminders",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/send-musician-reminders?windowHours=3", 
      "schedule": "0 15 * * *"
    }
  ]
}
```

#### Netlify (Production)
צור `netlify/functions/cron-reminders.js`:
```javascript
exports.handler = async (event, context) => {
  const response = await fetch(`${process.env.URL}/api/cron/send-musician-reminders`, {
    method: 'POST'
  })
  
  return {
    statusCode: 200,
    body: JSON.stringify(await response.json())
  }
}
```

#### Local Development  
להרצה ידנית:
```bash
npm run cron:once
```

## 📁 מבנה הפרויק트

```
heyda/
├── app/                    # Next.js App Router
│   ├── actions/           # Server Actions  
│   ├── api/cron/         # Cron endpoints
│   ├── leads/            # עמודי לידים
│   ├── events/           # עמודי אירועים
│   ├── treasury/         # עמודי כספים
│   └── vendors/          # עמודי ספקים
├── components/            # רכיבי UI
├── lib/                   # Utilities וBusinessLogic
│   ├── prisma.ts         # Prisma client
│   ├── settlement.ts     # חישובי רווחים
│   ├── treasury.ts       # מערכת כספים
│   ├── calendar.ts       # Google Calendar
│   └── mailer.ts         # שליחת מיילים  
├── prisma/               # מסד נתונים
│   ├── schema.prisma     # מודל הנתונים
│   └── seed.ts           # נתוני דוגמה
└── README.md
```

## 📊 Business Logic המפתח

### זרימת Lead → Opportunity → Event
1. **Lead** נוצר מפנייה ראשונית
2. **Opportunity** נוצרת עם פירוט הצעה ופריטים
3. **Event** נוצר מניצחון הזדמנות עם העברת כל הפרטים

### מערכת Settlement (חישוב רווחים)
```
Gross = Σ Revenue Items
Costs = Σ Expenses  
Net = Gross - Costs - Processing Fees
```

**חלוקה לפי מדיניות:**
- **PERCENT**: A = Net × Share_A, B = Net × Share_B
- **FIXED**: A = Fixed_A, B = Fixed_B  
- **MIX**: Base amounts + split remainder 50/50

**Fund Floor**: מינימום לקופה, מקטין חלקי שותפים באופן סימטרי

### Treasury (מערכת כספים)
- **Auto-linking**: הכנסה/הוצאה עם חשבון → יצירת transaction אוטומטית
- **Transfers**: העברות בין חשבונות עם journal group משותף
- **Balances**: Opening + Σ IN - Σ OUT

### Double-Booking Prevention  
בלימת שיוך נגן ל-2+ אירועים חופפים:
```sql
WHERE musician_id = X 
AND status = 'ACCEPTED'
AND (start_time < event.end_time AND end_time > event.start_time)
```

## 🎯 תכונות עיקריות במערכת

### ✅ מומש במלואו
- ✅ ניהול לידים עם קנבן
- ✅ יצירת הזדמנויות עם פריטים
- ✅ ניהול אירועים מלא
- ✅ מערכת Settlement עם מדיניות חלוקה
- ✅ Treasury עם העברות ויתרות
- ✅ Double-booking prevention
- ✅ תזכורות אוטומטיות לנגנים
- ✅ אינטגרציה עם Google Calendar
- ✅ ממשק בעברית עם RTL
- ✅ Server Actions ב-Next.js 15

### 📋 נותר לפיתוח עתידי
- דפי Events מפורטים (Event Hub מלא)
- דפי ספקים ונגנים
- דוחות וגרפים
- ייצוא CSV
- מערכת התראות
- ניהול משתמשים ורשאות

## 🎪 הדגמה

להרצת הדגמה מהירה:

```bash
npm install
npx prisma db push  
npm run db:seed
npm run dev
```

נתוני הדוגמה כוללים:
- 3 חשבונות כספיים (2 שותפים + קופה)
- מדיניות חלוקה ברירת מחדל
- 2 נגנים לדוגמה
- ספק סאונד
- ליד ואירוע לדוגמה עם הכנסות והוצאות

## 🚀 Deploy לפרודקשן

### Vercel
```bash  
npm i -g vercel
vercel --prod
```

### Netlify
```bash
npm run build
# העלה את תיקיית .next
```

**חשוב**: הגדר משתני סביבה בפלטפורמת הדפלוי ווודא שה-Calendar Service Account משותף עם יומן היעד.

---

**נוצר עם ❤️ עבור חברת היידה**
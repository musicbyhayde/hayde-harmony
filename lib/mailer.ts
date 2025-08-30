import nodemailer from 'nodemailer'
import { env } from './env'

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransporter({
      host: env.SMTP_HOST,
      port: parseInt(env.SMTP_PORT),
      secure: env.SMTP_SECURE === 'true',
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    })
  }
  return transporter
}

export interface MusicianReminderData {
  musicianName: string
  musicianEmail: string
  eventTitle: string
  eventDate: string
  startTime: string
  endTime: string
  venue?: string
  role?: string
  fee?: number
  calendarLink?: string
}

export function generateMusicianReminderEmail(data: MusicianReminderData): { subject: string; html: string } {
  const subject = `תזכורת להופעה – ${data.eventTitle} (${data.eventDate})`
  
  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>תזכורת הופעה</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f7f7f7;
            direction: rtl;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
        }
        .content {
            padding: 30px;
        }
        .event-details {
            background: #f8f9ff;
            border-right: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .detail-row {
            margin: 10px 0;
            display: flex;
            align-items: center;
        }
        .detail-label {
            font-weight: bold;
            color: #333;
            min-width: 80px;
            margin-left: 10px;
        }
        .detail-value {
            color: #666;
        }
        .checklist {
            background: #fff7f0;
            border-right: 4px solid #ff9800;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .checklist h3 {
            margin-top: 0;
            color: #ff9800;
        }
        .checklist ul {
            margin: 0;
            padding-right: 20px;
        }
        .checklist li {
            margin: 8px 0;
            color: #666;
        }
        .calendar-button {
            display: inline-block;
            background: #4CAF50;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
            text-align: center;
        }
        .calendar-button:hover {
            background: #45a049;
        }
        .footer {
            background: #f5f5f5;
            padding: 20px 30px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .signature {
            margin-top: 20px;
            font-style: italic;
            color: #667eea;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎵 תזכורת להופעה</h1>
        </div>
        
        <div class="content">
            <p>שלום ${data.musicianName},</p>
            
            <p>זו תזכורת להופעה הקרובה שלך:</p>
            
            <div class="event-details">
                <div class="detail-row">
                    <span class="detail-label">אירוע:</span>
                    <span class="detail-value">${data.eventTitle}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">תאריך:</span>
                    <span class="detail-value">${data.eventDate}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">שעה:</span>
                    <span class="detail-value">${data.startTime} - ${data.endTime}</span>
                </div>
                ${data.venue ? `
                <div class="detail-row">
                    <span class="detail-label">מקום:</span>
                    <span class="detail-value">${data.venue}</span>
                </div>
                ` : ''}
                ${data.role ? `
                <div class="detail-row">
                    <span class="detail-label">תפקיד:</span>
                    <span class="detail-value">${data.role}</span>
                </div>
                ` : ''}
                ${data.fee ? `
                <div class="detail-row">
                    <span class="detail-label">שכר:</span>
                    <span class="detail-value">₪${data.fee.toLocaleString('he-IL')}</span>
                </div>
                ` : ''}
            </div>

            ${data.calendarLink ? `
            <a href="${data.calendarLink}" class="calendar-button">
                📅 פתח ביומן גוגל
            </a>
            ` : ''}
            
            <div class="checklist">
                <h3>📋 רשימת בדיקה להופעה</h3>
                <ul>
                    <li>ודא שכל הציוד שלך מוכן ותקין</li>
                    <li>הגע למקום 30 דקות לפני תחילת ההופעה</li>
                    <li>בדוק את כתובת המקום ותנאי החניה מראש</li>
                    <li>הבא מטען לטלפון ומים</li>
                    <li>וודא שיש לך את פרטי איש הקשר באתר</li>
                </ul>
            </div>
            
            <p>אם יש לך שאלות או בעיות, אנא צור קשר מיד.</p>
            <p>בהצלחה והופעה מוצלחת! 🎶</p>
            
            <div class="signature">
                בברכה,<br>
                צוות היידה
            </div>
        </div>
        
        <div class="footer">
            <p>אימייל זה נשלח אוטומטית ממערכת ניהול האירועים של היידה.</p>
            <p>לשאלות ובעיות: <a href="mailto:${env.SMTP_USER}">${env.SMTP_USER}</a></p>
        </div>
    </div>
</body>
</html>`

  return { subject, html }
}

export async function sendMusicianReminder(data: MusicianReminderData): Promise<void> {
  const transporter = getTransporter()
  const { subject, html } = generateMusicianReminderEmail(data)

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: data.musicianEmail,
    subject,
    html
  })
}
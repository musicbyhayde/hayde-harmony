import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXT_PUBLIC_BASE_URL: z.string().url(),
  TZ: z.string().default('Asia/Jerusalem'),
  
  // SMTP
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.string().min(1),
  SMTP_SECURE: z.string().default('false'),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string().min(1),
  SMTP_FROM: z.string().min(1),
  
  // Google Calendar
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().email(),
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string().min(1),
  CALENDAR_ID: z.string().email(),
})

// Parse and validate environment variables
export const env = envSchema.parse(process.env)

// Helper to fix Google private key newlines
export function getGooglePrivateKey(): string {
  return env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n')
}

// Timezone helper
export function getTimezone(): string {
  return env.TZ
}
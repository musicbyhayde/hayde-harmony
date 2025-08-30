import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import 'dayjs/locale/he'
import { getTimezone } from './env'

// Configure dayjs plugins
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('he')

// Default timezone
dayjs.tz.setDefault(getTimezone())

export { dayjs }

// Utility functions for Hebrew formatting
export function formatDateHe(date: string | Date | dayjs.Dayjs): string {
  return dayjs(date).tz(getTimezone()).format('DD/MM/YYYY')
}

export function formatDateTimeHe(date: string | Date | dayjs.Dayjs): string {
  return dayjs(date).tz(getTimezone()).format('DD/MM/YYYY HH:mm')
}

export function formatTimeHe(date: string | Date | dayjs.Dayjs): string {
  return dayjs(date).tz(getTimezone()).format('HH:mm')
}
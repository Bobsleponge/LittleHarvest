import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'ZAR'): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function calculateAgeInMonths(birthDate: Date): number {
  const today = new Date()
  const birth = new Date(birthDate)
  
  let months = (today.getFullYear() - birth.getFullYear()) * 12
  months += today.getMonth() - birth.getMonth()
  
  if (today.getDate() < birth.getDate()) {
    months--
  }
  
  return months
}

export function getSuggestedAgeGroup(ageInMonths: number): string {
  if (ageInMonths >= 6 && ageInMonths <= 8) return '6-8 months'
  if (ageInMonths >= 9 && ageInMonths <= 12) return '9-12 months'
  if (ageInMonths >= 12 && ageInMonths <= 24) return '12-24 months'
  if (ageInMonths >= 24 && ageInMonths <= 48) return '24-48 months'
  return '6-8 months' // Default
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateSlug(name: string): string {
  return slugify(name)
}


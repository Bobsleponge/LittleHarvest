import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tiny Tastes - Fresh Baby Food Delivered',
  description: 'Nutritious, organic baby food made with love and delivered fresh to your door. Give your little one the best start in life.',
  keywords: 'baby food, organic, fresh, delivery, nutrition, infant food',
  authors: [{ name: 'Tiny Tastes' }],
  openGraph: {
    title: 'Tiny Tastes - Fresh Baby Food Delivered',
    description: 'Nutritious, organic baby food made with love and delivered fresh to your door.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}

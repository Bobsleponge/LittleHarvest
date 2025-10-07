import type { AppProps } from 'next/app'
import { Inter } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import { AdminDateProvider } from '../src/lib/admin-date-context'
import { CartProvider } from '../src/lib/cart-context'
import { UISettingsProvider } from '../src/lib/ui-settings-context'
import FloatingCartIcon from '../src/components/floating-cart-icon'
import { useRouter } from 'next/router'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const isAdminRoute = router.pathname.startsWith('/admin')
  
  return (
    <div className={inter.className}>
      <UISettingsProvider>
        <CartProvider>
          {isAdminRoute ? (
            <AdminDateProvider>
              <Component {...pageProps} />
            </AdminDateProvider>
          ) : (
            <Component {...pageProps} />
          )}
          {/* Floating cart icon - only show on non-admin pages */}
          {!isAdminRoute && <FloatingCartIcon />}
        </CartProvider>
      </UISettingsProvider>
    </div>
  )
}

export default function App(props: AppProps) {
  return (
    <SessionProvider session={props.pageProps.session}>
      <AppContent {...props} />
    </SessionProvider>
  )
}

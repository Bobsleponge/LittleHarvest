import { useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function SignOutPage() {
  const router = useRouter()

  useEffect(() => {
    // Sign out and redirect to home page
    signOut({ callbackUrl: '/' })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Signing you out...</p>
      </div>
    </div>
  )
}

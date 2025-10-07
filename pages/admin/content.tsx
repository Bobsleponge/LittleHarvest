import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function ContentRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard since content management is not implemented
    router.replace('/admin')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Dashboard...</p>
        <p className="text-sm text-gray-500 mt-2">Content management is not currently implemented.</p>
      </div>
    </div>
  )
}
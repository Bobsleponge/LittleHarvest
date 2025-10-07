import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function ProductsRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new combined page
    router.replace('/admin/products-inventory')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Products & Inventory...</p>
      </div>
    </div>
  )
}

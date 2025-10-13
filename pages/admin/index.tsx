import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AdminIndex() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the combined Analytics Dashboard
    router.replace('/admin/analytics-dashboard')
  }, [router])

  return null
}

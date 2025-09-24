'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminTestPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Authentication Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <strong>Status:</strong> {status}
            </div>
            <div>
              <strong>Session:</strong> {session ? 'Authenticated' : 'Not authenticated'}
            </div>
            {session && (
              <>
                <div>
                  <strong>User ID:</strong> {session.user?.id}
                </div>
                <div>
                  <strong>Name:</strong> {session.user?.name}
                </div>
                <div>
                  <strong>Email:</strong> {session.user?.email}
                </div>
                <div>
                  <strong>Role:</strong> {session.user?.role}
                </div>
                <div>
                  <strong>Is Admin:</strong> {session.user?.role === 'ADMIN' ? 'Yes' : 'No'}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, AlertTriangle, CheckCircle, Eye } from 'lucide-react'

export default function AdminSecurityPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Center</h1>
          <p className="text-gray-600">Monitor security and access controls</p>
        </div>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          View Logs
        </Button>
      </div>

      {/* Coming Soon */}
      <Card className="gradient-card shadow-modern">
        <CardContent className="text-center py-12">
          <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Security Center</h3>
          <p className="text-gray-500 mb-4">
            This section will allow you to monitor security events, manage access controls, and view audit logs.
          </p>
          <p className="text-sm text-gray-400">
            Coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

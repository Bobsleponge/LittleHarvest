'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  CreditCard,
  DollarSign
} from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading'
import { formatDate } from '@/lib/order-utils'

interface PaymentStatistics {
  pending: number
  paid: number
  unpaid: number
  expired: number
  total: number
}

interface ApproachingOrder {
  id: string
  orderNumber: string
  totalZar: number
  paymentDueDate: string
  user: {
    name: string
    email: string
  }
  items: Array<{
    product: { name: string }
    portionSize: { name: string }
    quantity: number
  }>
}

export function PaymentTimeoutManager() {
  const [statistics, setStatistics] = useState<PaymentStatistics | null>(null)
  const [approachingOrders, setApproachingOrders] = useState<ApproachingOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [lastProcessed, setLastProcessed] = useState<Date | null>(null)

  useEffect(() => {
    fetchPaymentData()
  }, [])

  const fetchPaymentData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/orders/process-expired')
      
      if (response.ok) {
        const data = await response.json()
        setStatistics(data.statistics)
        setApproachingOrders(data.approachingOrders)
      }
    } catch (error) {
      console.error('Error fetching payment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processExpiredPayments = async () => {
    try {
      setProcessing(true)
      const response = await fetch('/api/admin/orders/process-expired', {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        setStatistics(data.statistics)
        setApproachingOrders(data.approachingOrders)
        setLastProcessed(new Date())
        
        if (data.result.processed > 0) {
          alert(`Successfully processed ${data.result.processed} expired orders`)
        } else {
          alert('No expired orders found to process')
        }
      } else {
        alert('Failed to process expired payments')
      }
    } catch (error) {
      console.error('Error processing expired payments:', error)
      alert('Error processing expired payments')
    } finally {
      setProcessing(false)
    }
  }

  const getTimeUntilDeadline = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffMs = due.getTime() - now.getTime()
    
    if (diffMs <= 0) return 'Expired'
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`
    } else {
      return `${diffMinutes}m`
    }
  }

  const getUrgencyColor = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffMs = due.getTime() - now.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    
    if (diffMs <= 0) return 'text-red-600'
    if (diffHours <= 1) return 'text-red-500'
    if (diffHours <= 2) return 'text-orange-500'
    return 'text-yellow-500'
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Payment Statistics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Payment Statistics
              </CardTitle>
              <CardDescription>
                Overview of payment statuses across all orders
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPaymentData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {statistics && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{statistics.pending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{statistics.paid}</div>
                <div className="text-sm text-muted-foreground">Paid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{statistics.unpaid}</div>
                <div className="text-sm text-muted-foreground">Unpaid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{statistics.expired}</div>
                <div className="text-sm text-muted-foreground">Expired</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{statistics.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expired Payment Processing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            Expired Payment Processing
          </CardTitle>
          <CardDescription>
            Manually process orders with expired payment deadlines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This will automatically cancel orders with expired payment deadlines and return stock to inventory.
            </AlertDescription>
          </Alert>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={processExpiredPayments}
              disabled={processing}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {processing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Process Expired Payments
                </>
              )}
            </Button>
            
            {lastProcessed && (
              <div className="text-sm text-muted-foreground">
                Last processed: {formatDate(lastProcessed)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders Approaching Deadline */}
      {approachingOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Orders Approaching Payment Deadline
            </CardTitle>
            <CardDescription>
              Orders with payment deadlines within the next 2 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {approachingOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">#{order.orderNumber}</span>
                      <Badge variant="outline">{order.user.name}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.items.length} item(s) • {formatDate(order.paymentDueDate)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-emerald-600">
                      R{order.totalZar.toFixed(2)}
                    </div>
                    <div className={`text-sm font-medium ${getUrgencyColor(order.paymentDueDate)}`}>
                      {getTimeUntilDeadline(order.paymentDueDate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Automated Processing Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Automated Processing
          </CardTitle>
          <CardDescription>
            Information about automated payment timeout processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Expired payments are automatically processed every hour</p>
            <p>• Orders with payment deadlines over 24 hours old are cancelled</p>
            <p>• Stock reservations are automatically released for cancelled orders</p>
            <p>• Customers are notified when orders are cancelled due to non-payment</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

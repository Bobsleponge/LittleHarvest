import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ErrorPageProps {
  searchParams: {
    error?: string
  }
}

export default function ErrorPage({ searchParams }: ErrorPageProps) {
  const error = searchParams.error

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.'
      case 'AccessDenied':
        return 'Access denied. You do not have permission to sign in.'
      case 'Verification':
        return 'The verification token has expired or has already been used.'
      case 'Default':
        return 'An error occurred during sign in.'
      default:
        return 'An unexpected error occurred. Please try again.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-destructive-foreground" />
          </div>
          <CardTitle className="text-2xl">Sign In Error</CardTitle>
          <CardDescription>
            Something went wrong during sign in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {error ? getErrorMessage(error) : 'An unexpected error occurred. Please try again.'}
            </p>
          </div>

          <div className="space-y-4">
            <Button className="w-full" asChild>
              <Link href="/auth/signin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Try Again
              </Link>
            </Button>
            
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Need help? </span>
              <Link href="/contact" className="text-primary hover:underline">
                Contact Support
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription>
            We've sent you a magic link to sign in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              We've sent a sign-in link to your email address. Click the link in the email to complete your sign-in.
            </p>
            <p className="text-sm text-muted-foreground">
              The link will expire in 24 hours for security reasons.
            </p>
          </div>

          <div className="space-y-4">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/auth/signin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Link>
            </Button>
            
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Didn't receive the email? </span>
              <Link href="/auth/signin" className="text-primary hover:underline">
                Try again
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

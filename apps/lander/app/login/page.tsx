'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Github } from 'lucide-react';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl: '/' });
  };

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    await signIn('github', { callbackUrl: '/' });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign in to Sales App</CardTitle>
          <CardDescription className="text-center">
            Sign in with your preferred account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error === 'Callback' ? 'Something went wrong with the sign in process. Please try again.' : 
                 error === 'AccessDenied' ? 'You do not have permission to sign in.' : 
                 'An error occurred during sign in. Please try again.'}
              </AlertDescription>
            </Alert>
          )}
          
          <Button 
            className="w-full" 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </Button>
          
          <Button 
            className="w-full flex items-center justify-center gap-2" 
            onClick={handleGithubSignIn}
            disabled={isLoading}
            variant="outline"
          >
            <Github className="h-4 w-4" />
            {isLoading ? 'Signing in...' : 'Sign in with GitHub'}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-gray-500">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </CardFooter>
      </Card>
    </div>
  );
}
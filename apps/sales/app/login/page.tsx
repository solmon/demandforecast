'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);

  const handleProviderLogin = async (provider: string) => {
    setIsLoading(true);
    setError(null);
    setActiveProvider(provider);
    
    try {
      if (provider === 'gcp-iam') {
        await handleGCPLogin();
      } else {
        await signIn(provider, { callbackUrl: '/dashboard' });
      }
    } catch (err) {
      console.error(`${provider} login error:`, err);
      setError(`Failed to authenticate with ${provider}`);
      setIsLoading(false);
      setActiveProvider(null);
    }
  };

  const handleGCPLogin = async () => {
    try {
      // Initialize Google Identity Services API
      const client = await window.google.accounts.oauth2.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        scope: 'email profile',
        callback: async (response) => {
          if (response.error) {
            setError(response.error);
            setIsLoading(false);
            setActiveProvider(null);
            return;
          }

          // Get the ID token from response
          const idToken = response.access_token;

          // Sign in using NextAuth with GCP IAM provider
          const result = await signIn('gcp-iam', {
            idToken,
            redirect: false,
          });

          if (result?.error) {
            setError(result.error);
          } else if (result?.url) {
            router.push('/dashboard');
          }
          
          setIsLoading(false);
          setActiveProvider(null);
        },
      });

      // Request the token
      client.requestAccessToken();
    } catch (err) {
      console.error('GCP IAM login error:', err);
      setError('Failed to authenticate with GCP IAM');
      setIsLoading(false);
      setActiveProvider(null);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-lg w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-500">Sign in to your account to continue</p>
        </div>
        
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Google SSO Button */}
          <button
            onClick={() => handleProviderLogin('google')}
            disabled={isLoading}
            className="flex items-center justify-center w-full p-3 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 transition-colors relative"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 mr-2">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z" />
              <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z" />
              <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z" />
              <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z" />
            </svg>
            Sign in with Google
            {isLoading && activeProvider === 'google' && (
              <span className="absolute right-3">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </span>
            )}
          </button>
          
          {/* GitHub SSO Button */}
          <button
            onClick={() => handleProviderLogin('github')}
            disabled={isLoading}
            className="flex items-center justify-center w-full p-3 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 transition-colors relative"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 mr-2" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Sign in with GitHub
            {isLoading && activeProvider === 'github' && (
              <span className="absolute right-3">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </span>
            )}
          </button>
          
          {/* Facebook SSO Button */}
          <button
            onClick={() => handleProviderLogin('facebook')}
            disabled={isLoading}
            className="flex items-center justify-center w-full p-3 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 transition-colors relative"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 mr-2" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Sign in with Facebook
            {isLoading && activeProvider === 'facebook' && (
              <span className="absolute right-3">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </span>
            )}
          </button>
          
          {/* GCP IAM SSO Button */}
          <button
            onClick={() => handleProviderLogin('gcp-iam')}
            disabled={isLoading}
            className="flex items-center justify-center w-full p-3 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 transition-colors relative"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M12.75 13.55v4.792a.71.71 0 0 1-.708.708H5.458a.71.71 0 0 1-.708-.708v-4.792l4 2.35 4-.001z" />
              <path fill="#34A853" d="M20.5 9.25h-4.792v3.542l3.625 2.125a.71.71 0 0 0 1.083-.605V9.956a.71.71 0 0 0-.708-.706h-.208z" />
              <path fill="#FBBC04" d="M5.458 4.958h6.584a.71.71 0 0 1 .708.708v7.884l-4 2.35-4-2.35V5.667a.71.71 0 0 1 .708-.708z" />
              <path fill="#EA4335" d="M15.708 9.25V5.667a.71.71 0 0 0-.708-.708H9.25v8.592l4 2.35v-3.542h2.833a.71.71 0 0 0 .708-.708V9.25h-1.083z" />
            </svg>
            Sign in with GCP IAM
            {isLoading && activeProvider === 'gcp-iam' && (
              <span className="absolute right-3">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </span>
            )}
          </button>
        </div>
        
        <div className="pt-4 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy.
            <br/>
            This is a multi-tenant application. Your access will be based on your assigned roles.
          </p>
        </div>
        
        {isLoading && !activeProvider && (
          <div className="flex justify-center text-center text-gray-500">
            <div className="animate-spin inline-block w-5 h-5 border-2 border-gray-400 border-t-blue-500 rounded-full mr-2"></div>
            Authenticating...
          </div>
        )}
      </div>
    </div>
  );
}

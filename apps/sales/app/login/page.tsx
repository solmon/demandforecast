'use client';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const handleLogin = async () => {
    await signIn('gcp-iam', {
      callbackUrl: 'http://localhost:3001/auth/google/callback',
    });
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-6 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4">Sign in with GCP IAM</h1>
        <button
          onClick={handleLogin}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

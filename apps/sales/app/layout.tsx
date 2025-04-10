import type React from 'react';
import '@/app/globals.css';
import { ThemeProvider } from '@/src/components/theme-provider';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session && typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
    return null;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title> Analytics Dashboard</title>
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

import './globals.css';

export const metadata = {
  generator: 'v0.dev',
};

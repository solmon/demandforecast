import type React from 'react';
import '@/app/globals.css';
import { ThemeProvider } from '@/src/components/theme-provider';
import AuthProvider from './providers/auth-provider';

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title> Analytics Dashboard</title>
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import './globals.css';

export const metadata = {
  generator: 'v0.dev',
};

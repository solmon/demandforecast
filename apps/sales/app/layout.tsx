import type React from 'react';
import '@/app/globals.css';
import { ThemeProvider } from '@/src/components/theme-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
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

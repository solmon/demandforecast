import Dashboard from '@/src/components/dashboard';

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <a href="/dashboard" className="flex items-center space-x-2 text-primary hover:underline">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10h4v11H3V10zm7-7h4v18h-4V3zm7 4h4v14h-4V7z"
        />
      </svg>
      <span>Analytical Sales Dashboard</span>
      </a>
      {/* <Dashboard /> */}
    </main>
  );
}

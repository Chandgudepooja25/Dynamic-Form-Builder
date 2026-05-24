import type { Metadata } from 'next';
import './globals.css';
import { Topbar } from '@/components/layout/Topbar';
import { AuthHydrator } from '@/components/layout/AuthHydrator';
import { Toaster } from '@/components/ui/Toaster';

export const metadata: Metadata = {
  title: 'FormCraft — Dynamic Form Builder',
  description:
    'Build logic-driven, Typeform-style forms with conditional questions, multi-step filling, and CSV export.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-dvh min-h-0">
      <body className="m-0 flex h-dvh min-h-0 flex-col overflow-x-hidden overflow-y-hidden text-slate-900">
        <AuthHydrator />
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-x-hidden">
          <Topbar />
          <main className="min-h-0 w-full min-w-0 flex-1 scroll-smooth overflow-y-auto">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}

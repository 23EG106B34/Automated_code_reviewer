import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-grid-bg min-h-screen">
      <header className="border-b border-zinc-800/80 glass-panel">
        <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center px-4 sm:px-6 lg:px-10">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-100">automated_code_reviewer</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-10">{children}</main>
    </div>
  );
}

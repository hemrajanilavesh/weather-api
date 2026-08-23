import { CloudSun, Command as CommandIcon } from 'lucide-react';
import Pill from './ui/Pill';

export default function Header({ onOpenPalette }: { onOpenPalette?: () => void }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-background/80 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 blur-xl rounded-full" />
              <CloudSun className="relative w-8 h-8 text-indigo-300" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground tracking-tight">Weather Dashboard</h1>
              <p className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase">Real-time weather data</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenPalette}
              aria-label="Open command palette (⌘K)"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground border border-white/10 bg-white/5 hover:bg-white/10 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <CommandIcon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Search city…</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-muted-foreground">⌘K</kbd>
            </button>
            <Pill tone="accent" pulsing>
              Live
            </Pill>
          </div>
        </div>
      </div>
    </header>
  );
}

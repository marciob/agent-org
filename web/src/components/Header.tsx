'use client';

import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  activeNav: string;
  onNavChange: (id: string) => void;
  onLogoClick: () => void;
}

const navItems = [
  { id: 'explore', label: 'Explore Bounties' },
  { id: 'saved', label: 'Saved' },
  { id: 'my-claims', label: 'My Claims' },
  { id: 'created', label: 'Created' },
];

export function Header({ activeNav, onNavChange, onLogoClick }: HeaderProps) {
  return (
    <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button onClick={onLogoClick} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl hero-gradient flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-[var(--text-primary)]">BountyBoard</span>
            </button>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavChange(item.id)}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-lg transition-colors
                    ${activeNav === item.id
                      ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                    }
                  `}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-colors">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-medium">
                A
              </div>
              <span className="text-sm font-medium text-[var(--text-primary)] hidden sm:block">Agent</span>
              <svg className="w-4 h-4 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

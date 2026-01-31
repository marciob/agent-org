'use client';

interface HeroBannerProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function HeroBanner({ searchQuery, onSearchChange }: HeroBannerProps) {
  return (
    <div className="hero-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Find the Perfect Bounty for Your AI Agent
          </h1>
          <p className="text-white/80 text-sm sm:text-base mb-6">
            Explore bounties and let AI agents complete tasks to earn rewards.
          </p>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search bounties..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full h-12 pl-12 pr-4 text-sm bg-white rounded-xl border-0 focus:ring-2 focus:ring-white/50 placeholder:text-gray-400"
              />
            </div>
            <button className="h-12 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type SearchResult = {
  category: string;
  items: { id: string | number; label: string; sub?: string; href: string }[];
};

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (href: string) => {
    setOpen(false);
    setQuery('');
    router.push(href);
  };

  const totalResults = results.reduce((acc, r) => acc + r.items.length, 0);

  return (
    <div ref={containerRef} className="relative hidden md:flex items-center">
      <div className="flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-white/30 px-3 py-1 bg-white/10">
        <Image
          src="/search.png"
          alt=""
          width={14}
          height={14}
          className="opacity-70"
        />
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setOpen(true)}
          className="w-[200px] p-1 bg-transparent outline-none text-white placeholder-white/40 text-sm"
        />
        {loading && (
          <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
        )}
      </div>

      {open && (
        <div className="absolute top-10 left-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          {totalResults === 0 ? (
            <div className="p-4 text-sm text-gray-400 text-center">
              No results for &quot;{query}&quot;
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {results.map((group) =>
                group.items.length > 0 ? (
                  <div key={group.category}>
                    <div className="px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
                      {group.category}
                    </div>
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.href)}
                        className="w-full flex flex-col px-4 py-2.5 hover:bg-blue-50 text-left transition-colors border-b border-gray-50 last:border-0"
                      >
                        <span className="text-sm font-medium text-gray-800">
                          {item.label}
                        </span>
                        {item.sub && (
                          <span className="text-xs text-gray-400">
                            {item.sub}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : null,
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;

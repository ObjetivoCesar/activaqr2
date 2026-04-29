'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchBar({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="relative w-full md:w-64 group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-brand transition-colors" />
      <input 
        type="text" 
        placeholder="Buscar por ticket o detalle..."
        defaultValue={defaultValue}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch((e.target as HTMLInputElement).value);
          }
        }}
        className="w-full bg-foreground/5 border border-border/40 rounded-xl py-2.5 pl-11 pr-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/50 transition-all"
      />
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Tab {
  id: string;
  label: string;
}

interface DashboardTabsProps {
  tabs: Tab[];
  currentTab: string;
  brandColor?: string;
}

export default function DashboardTabs({ tabs, currentTab, brandColor = '#2563eb' }: DashboardTabsProps) {
  const searchParams = useSearchParams();

  const getFilterUrl = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    params.set('page', '1');
    return `?${params.toString()}`;
  };

  return (
    <div className="flex gap-2 md:gap-4 nm-inset p-2 rounded-2xl overflow-x-auto w-full xl:w-auto snap-x scrollbar-hide">
      {tabs.map(tab => {
        const isActive = currentTab === tab.id;
        return (
          <Link 
            key={tab.id}
            href={getFilterUrl(tab.id)} 
            scroll={false} 
            style={isActive ? { backgroundColor: brandColor, boxShadow: `0 10px 20px -5px ${brandColor}4D` } : {}}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap snap-center transition-all duration-300
              ${isActive 
                ? 'text-white scale-105' 
                : 'text-foreground/60 dark:text-white/40 hover:text-foreground hover:bg-accent'}`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

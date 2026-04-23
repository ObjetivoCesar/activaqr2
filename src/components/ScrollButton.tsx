"use client";

import { ChevronDown } from 'lucide-react';

export default function ScrollButton() {
  return (
    <button 
      onClick={() => document.getElementById('content')?.scrollIntoView({ behavior: 'smooth' })}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40 hover:opacity-100 transition-opacity p-2 hover:text-brand"
    >
       <ChevronDown className="w-8 h-8" />
    </button>
  );
}

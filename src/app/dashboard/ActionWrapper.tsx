'use client';

import React from 'react';

interface ActionWrapperProps {
  children: React.ReactNode;
}

export default function ActionWrapper({ children }: ActionWrapperProps) {
  return (
    <div 
      className="inline-block" 
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {children}
    </div>
  );
}

'use client';

import { ReactNode } from 'react';

interface WidgetGridProps {
  children: ReactNode;
  columns?: number;
  gap?: number;
}

export default function WidgetGrid({ 
  children, 
  columns = 3, 
  gap = 6 
}: WidgetGridProps) {
  return (
    <div 
      className="grid auto-rows-min"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: `${gap * 0.25}rem`
      }}
    >
      {children}
    </div>
  );
}

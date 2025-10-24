'use client';

import { useState, useRef, useEffect } from 'react';
import { GripVertical, Maximize2, Minimize2 } from 'lucide-react';

interface WidgetProps {
  title: string;
  children: React.ReactNode;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  collapsible?: boolean;
}

export default function Widget({
  title,
  children,
  defaultWidth = 400,
  defaultHeight = 300,
  minWidth = 300,
  minHeight = 200,
  collapsible = true
}: WidgetProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [height, setHeight] = useState(defaultHeight);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleResize = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = width;
    const startHeight = height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      if (direction.includes('e')) {
        setWidth(Math.max(minWidth, startWidth + deltaX));
      }
      if (direction.includes('s')) {
        setHeight(Math.max(minHeight, startHeight + deltaY));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={widgetRef}
      className={`bg-white rounded-lg border border-gray-200 shadow-sm ${
        isDragging ? 'shadow-lg cursor-grabbing' : ''
      } ${isResizing ? 'select-none' : ''}`}
      style={{
        width: `${width}px`,
        height: isCollapsed ? 'auto' : `${height}px`,
        position: 'relative'
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-gray-200 cursor-grab active:cursor-grabbing"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center space-x-2">
          <GripVertical className="h-4 w-4 text-gray-400" />
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        {collapsible && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsCollapsed(!isCollapsed);
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isCollapsed ? (
              <Maximize2 className="h-4 w-4 text-gray-600" />
            ) : (
              <Minimize2 className="h-4 w-4 text-gray-600" />
            )}
          </button>
        )}
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-4 overflow-auto" style={{ height: `${height - 60}px` }}>
          {children}
        </div>
      )}

      {/* Resize Handles */}
      {!isCollapsed && (
        <>
          {/* Bottom-right corner */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={(e) => handleResize(e, 'se')}
          >
            <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-gray-400"></div>
          </div>
          
          {/* Right edge */}
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-e-resize hover:bg-primary-200"
            onMouseDown={(e) => handleResize(e, 'e')}
          />
          
          {/* Bottom edge */}
          <div
            className="absolute bottom-0 left-0 w-full h-1 cursor-s-resize hover:bg-primary-200"
            onMouseDown={(e) => handleResize(e, 's')}
          />
        </>
      )}
    </div>
  );
}

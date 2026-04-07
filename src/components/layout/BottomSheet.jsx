import React, { useState, useRef, useCallback, useEffect } from 'react';

const SNAP_COLLAPSED = 56;
const SNAP_EXPANDED = 0.65;

export default function BottomSheet({ open, onClose, children }) {
  const dragRef = useRef({ startY: 0, startH: 0, dragging: false });
  const [sheetHeight, setSheetHeight] = useState(SNAP_COLLAPSED);
  const [dragging, setDragging] = useState(false);
  const isExpanded = sheetHeight > SNAP_COLLAPSED + 20;

  useEffect(() => {
    if (open) setSheetHeight(SNAP_COLLAPSED);
  }, [open]);

  const onDragStart = useCallback((clientY) => {
    dragRef.current = { startY: clientY, startH: sheetHeight, dragging: true };
    setDragging(true);
  }, [sheetHeight]);

  const onDragMove = useCallback((clientY) => {
    if (!dragRef.current.dragging) return;
    const delta = dragRef.current.startY - clientY;
    const maxH = window.innerHeight * SNAP_EXPANDED;
    const newH = Math.max(SNAP_COLLAPSED, Math.min(maxH, dragRef.current.startH + delta));
    setSheetHeight(newH);
  }, []);

  const onDragEnd = useCallback(() => {
    dragRef.current.dragging = false;
    setDragging(false);
    const maxH = window.innerHeight * SNAP_EXPANDED;
    const mid = (SNAP_COLLAPSED + maxH) / 2;
    setSheetHeight(sheetHeight > mid ? maxH : SNAP_COLLAPSED);
  }, [sheetHeight]);

  const onTouchStart = (e) => onDragStart(e.touches[0].clientY);
  const onTouchMove = (e) => onDragMove(e.touches[0].clientY);
  const onTouchEnd = () => onDragEnd();

  if (!open) return null;

  return (
    <>
      {isExpanded && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)', transition: 'opacity 0.2s' }}
          onClick={onClose}
        />
      )}

      <div
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden rounded-t-2xl"
        style={{
          height: `${sheetHeight}px`,
          backgroundColor: 'var(--theme-sidebar-bg)',
          borderTop: '1px solid var(--theme-sidebar-border)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
          transition: dragging ? 'none' : 'height 0.25s ease',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex justify-center py-2 cursor-grab active:cursor-grabbing"
          onClick={() => setSheetHeight(isExpanded ? SNAP_COLLAPSED : window.innerHeight * SNAP_EXPANDED)}
        >
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--theme-border)' }} />
        </div>

        <div
          className="px-3 overflow-y-auto"
          style={{ height: `${sheetHeight - 28}px`, scrollbarWidth: 'none' }}
        >
          {children}
        </div>
      </div>
    </>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import ProgressRing from '../ui/ProgressRing';
import BottomSheet from './BottomSheet';

const HOVER_ZONE_WIDTH = 48; // px from left edge that triggers sidebar

const Sidebar = ({ items, activeCourseId, open, onClose, yearSem, subjectSlug, routePrefix, locked, onToggleLock, sidebarTop = 0 }) => {
  const navigate = useNavigate();
  const { lang, t, checked, progress } = useApp();
  const [hoveredId, setHoveredId] = useState(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const hideTimeoutRef = useRef(null);

  if (!items?.length) return null;

  const handleItemClick = (item) => {
    const idx = items.findIndex(i => i.id === item.id);
    if (idx !== -1) {
      navigate(`/${yearSem}/${subjectSlug}/${routePrefix}${idx + 1}`);
    }
    onClose();
    if (!locked) setOverlayVisible(false);
  };


  // Global mousemove listener for left-edge hover detection
  useEffect(() => {
    if (locked) return;
    const onMove = (e) => {
      if (e.clientX <= HOVER_ZONE_WIDTH) {
        clearTimeout(hideTimeoutRef.current);
        setOverlayVisible(true);
      }
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [locked]);

  const handleMouseLeave = () => {
    if (locked) return;
    hideTimeoutRef.current = setTimeout(() => setOverlayVisible(false), 300);
  };

  const handleMouseEnterSidebar = () => {
    if (locked) return;
    clearTimeout(hideTimeoutRef.current);
  };

  const showOverlay = !locked && overlayVisible;

  /* --- Toggle button --- */
  const toggleBtn = (
    <button
      onClick={(e) => { e.stopPropagation(); onToggleLock(); }}
      className="hidden lg:flex items-center justify-center hover:brightness-125"
      style={{
        position: 'absolute',
        right: '-14px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '14px',
        height: '40px',
        background: 'var(--theme-sidebar-bg)',
        border: '1px solid var(--theme-sidebar-border)',
        borderLeft: 'none',
        borderRadius: '0 8px 8px 0',
        boxShadow: '2px 0 6px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        zIndex: 10,
      }}
      aria-label={locked ? 'Unlock sidebar' : 'Lock sidebar'}
    >
      <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
        <path
          d={locked ? 'M5 1L1 5L5 9' : 'M1 1L5 5L1 9'}
          stroke="#3b82f6"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );

  const courseList = items.map(course => {
    const total = course.sectionCount || 0;
    let completed;
    if (course.src) {
      const prefix = (course.metaId || course.id) + '-';
      completed = total > 0
        ? Object.keys(progress).filter(k => k.startsWith(prefix) && progress[k]?.understood).length
        : 0;
    } else {
      const prefix = `${course.id}-`;
      completed = total > 0
        ? Object.keys(checked).filter(k => k.startsWith(prefix) && checked[k]).length
        : 0;
    }
    const isActive = activeCourseId === course.id;
    const isComplete = total > 0 && completed >= total;
    const hasProgress = completed > 0;
    const isHovered = hoveredId === course.id && !isActive;

    const buttonStyle = {
      position: 'relative',
      border: '1.5px solid transparent',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      ...(isActive ? {
        transform: 'scale(1.07)',
        borderColor: '#3b82f6',
        backgroundColor: 'var(--theme-hover-bg)',
        boxShadow: '0 4px 20px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)',
      } : isHovered ? {
        transform: 'scale(1.04)',
        borderColor: 'rgba(59, 130, 246, 0.25)',
        backgroundColor: 'var(--theme-hover-bg)',
        boxShadow: '0 2px 12px rgba(59, 130, 246, 0.1)',
      } : {
        transform: 'scale(1)',
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        boxShadow: 'none',
      }),
    };

    return (
      <button
        key={course.id}
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg w-full text-left"
        style={buttonStyle}
        onMouseEnter={() => setHoveredId(course.id)}
        onMouseLeave={() => setHoveredId(null)}
        onClick={() => handleItemClick(course)}
      >
        {isActive && (
          <div style={{
            position: 'absolute', left: '-1px', top: '20%', bottom: '20%',
            width: '3px', borderRadius: '0 3px 3px 0', background: '#3b82f6',
          }} />
        )}
        <ProgressRing size={20} completed={completed} total={total} isActive={isActive} />
        <div className="flex-1 min-w-0">
          <div className="text-xs truncate" style={{
            fontWeight: isActive ? 600 : 500,
            color: isActive ? '#fff' : (isComplete ? '#16a34a' : 'var(--theme-content-text)'),
            opacity: !hasProgress && !isActive ? 0.5 : 1,
          }}>
            {course.shortTitle[lang]}
          </div>
          {total > 0 && (
            <div
              className="text-[10px]"
              style={{ color: isComplete ? '#22c55e' : 'var(--theme-muted-text)' }}
              title={isComplete ? t('All sections completed', 'Toate secțiunile completate') : t(`${completed} of ${total} sections completed`, `${completed} din ${total} secțiuni completate`)}
            >
              {isComplete ? t('Complete', 'Complet') : `${completed}/${total}`}
            </div>
          )}
        </div>
      </button>
    );
  });

  return (
    <>
      {/* Mobile bottom sheet */}
      <BottomSheet open={open} onClose={onClose}>
        <nav className="flex flex-col gap-1 text-sm">{courseList}</nav>
      </BottomSheet>

      {/* Layout spacer when locked */}
      {locked && (
        <div data-sidebar className="hidden lg:block flex-shrink-0" style={{ width: '15%', minWidth: '160px' }} />
      )}

      {/* ===== Desktop sidebar (fixed, always present, animated) ===== */}
      <aside
        className="hidden lg:block fixed left-0 z-20"
        style={{
          width: '15%',
          minWidth: '160px',
          top: `${sidebarTop}px`,
          height: `calc(100vh - ${sidebarTop}px)`,
          transform: (locked || showOverlay) ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.2s ease-in-out',
          boxShadow: !locked && showOverlay ? '4px 0 16px rgba(0,0,0,0.2)' : 'none',
        }}
        onMouseEnter={handleMouseEnterSidebar}
        onMouseLeave={handleMouseLeave}
      >
        {toggleBtn}
        <div
          className="h-full p-3 text-sm overflow-y-auto"
          style={{
            backgroundColor: 'var(--theme-sidebar-bg)',
            borderRight: '1px solid var(--theme-sidebar-border)',
            scrollbarWidth: 'none',
          }}
        >
          <nav className="flex flex-col gap-1">{courseList}</nav>
        </div>
      </aside>

      {/* Toggle nub visible when sidebar is hidden */}
      {!locked && !showOverlay && (
        <button
          onClick={onToggleLock}
          className="hidden lg:flex items-center justify-center hover:brightness-125 fixed z-20"
          style={{
            left: '0',
            top: `calc(${sidebarTop}px + (100vh - ${sidebarTop}px) / 2)`,
            transform: 'translateY(-50%)',
            width: '14px',
            height: '40px',
            background: 'var(--theme-sidebar-bg)',
            border: '1px solid var(--theme-sidebar-border)',
            borderLeft: 'none',
            borderRadius: '0 8px 8px 0',
            boxShadow: '2px 0 6px rgba(0,0,0,0.15)',
            cursor: 'pointer',
          }}
          aria-label="Lock sidebar"
        >
          <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
            <path d="M1 1L5 5L1 9" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}


      <style>{`
        aside::-webkit-scrollbar, aside div::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
};

export default Sidebar;

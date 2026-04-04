import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import ProgressRing from '../ui/ProgressRing';

const HOVER_ZONE_WIDTH = 48; // px from left edge that triggers sidebar

const Sidebar = ({ items, activeCourseId, open, onClose, yearSem, subjectSlug, routePrefix, locked, onToggleLock }) => {
  const navigate = useNavigate();
  const { lang, t, checked } = useApp();
  const [hoveredId, setHoveredId] = useState(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [peeking, setPeeking] = useState(false);
  const hideTimeoutRef = useRef(null);
  const prevCompletedRef = useRef(null);

  if (!items?.length) return null;

  const handleItemClick = (item) => {
    const match = item.id.match(new RegExp(routePrefix + '(\\d+)$'));
    if (match) {
      navigate(`/${yearSem}/${subjectSlug}/${routePrefix}${match[1]}`);
    }
    onClose();
    if (!locked) setOverlayVisible(false);
  };

  const totalCompleted = items.reduce((count, course) => {
    const total = course.sectionCount || 0;
    if (total === 0) return count;
    const prefix = `${course.id}-`;
    const done = Object.keys(checked).filter(k => k.startsWith(prefix) && checked[k]).length;
    return done >= total ? count + 1 : count;
  }, 0);

  useEffect(() => {
    if (locked) return;
    if (prevCompletedRef.current === null) {
      prevCompletedRef.current = totalCompleted;
      return;
    }
    if (totalCompleted > prevCompletedRef.current) {
      setPeeking(true);
      const timer = setTimeout(() => setPeeking(false), 2000);
      prevCompletedRef.current = totalCompleted;
      return () => clearTimeout(timer);
    }
    prevCompletedRef.current = totalCompleted;
  }, [totalCompleted, locked]);

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

  const showOverlay = !locked && (overlayVisible || peeking);

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
    const prefix = `${course.id}-`;
    const completed = total > 0
      ? Object.keys(checked).filter(k => k.startsWith(prefix) && checked[k]).length
      : 0;
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
            <div className="text-[10px]" style={{ color: isComplete ? '#22c55e' : 'var(--theme-muted-text)' }}>
              {isComplete ? t('Complete', 'Complet') : `${completed}/${total}`}
            </div>
          )}
        </div>
      </button>
    );
  });

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* ===== LOCKED: in-flow sticky sidebar ===== */}
      {locked && (
        <div
          className="hidden lg:block flex-shrink-0 sticky top-0 self-start"
          style={{
            width: '15%',
            minWidth: '160px',
            height: '100vh',
            position: 'sticky',
          }}
        >
          {/* Button on the outer sticky wrapper so it stays fixed at 50% viewport */}
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
        </div>
      )}

      {/* ===== UNLOCKED: just a toggle nub in flow + overlay on hover ===== */}
      {!locked && !showOverlay && (
        <div
          className="hidden lg:block flex-shrink-0 sticky top-0 self-start"
          style={{ width: '0px', height: '100vh', position: 'sticky', zIndex: 5 }}
        >
          <button
            onClick={onToggleLock}
            className="hidden lg:flex items-center justify-center hover:brightness-125"
            style={{
              position: 'absolute',
              left: '0',
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
            }}
            aria-label="Lock sidebar"
          >
            <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
              <path d="M1 1L5 5L1 9" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}

      {/* ===== UNLOCKED overlay sidebar ===== */}
      {showOverlay && (
        <aside
          className="hidden lg:block fixed top-0 left-0 z-40 shadow-xl"
          style={{
            width: '15%',
            minWidth: '160px',
            height: '100vh',
          }}
          onMouseEnter={handleMouseEnterSidebar}
          onMouseLeave={handleMouseLeave}
        >
          {/* Button on outer fixed container so it stays at 50% viewport */}
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
            aria-label="Lock sidebar"
          >
            <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
              <path d="M1 1L5 5L1 9" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div
            className="h-full p-3 text-sm overflow-y-auto"
            style={{
              paddingTop: 'calc(3rem + 8px)',
              backgroundColor: 'var(--theme-sidebar-bg)',
              borderRight: '1px solid var(--theme-sidebar-border)',
              scrollbarWidth: 'none',
            }}
          >
            <nav className="flex flex-col gap-1">{courseList}</nav>
          </div>
        </aside>
      )}

      {/* Mobile sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 lg:hidden
          w-60 h-full overflow-y-auto
          p-3 pt-16 text-sm
          transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          backgroundColor: 'var(--theme-sidebar-bg)',
          borderRight: '1px solid var(--theme-sidebar-border)',
        }}
      >
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="p-1 rounded transition" style={{ backgroundColor: 'var(--theme-hover-bg)' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col gap-1">{courseList}</nav>
      </aside>

      <style>{`
        aside::-webkit-scrollbar, aside div::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
};

export default Sidebar;

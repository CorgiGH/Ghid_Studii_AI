import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import ProgressRing from '../ui/ProgressRing';
import SidebarToggle from '../ui/SidebarToggle';

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

  // Count total completed courses for auto-peek
  const totalCompleted = items.reduce((count, course) => {
    const total = course.sectionCount || 0;
    if (total === 0) return count;
    const prefix = `${course.id}-`;
    const done = Object.keys(checked).filter(k => k.startsWith(prefix) && checked[k]).length;
    return done >= total ? count + 1 : count;
  }, 0);

  // Auto-peek when a course is newly completed (unlocked mode only)
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

  const handleMouseEnter = () => {
    if (locked) return;
    clearTimeout(hideTimeoutRef.current);
    setOverlayVisible(true);
  };

  const handleMouseLeave = () => {
    if (locked) return;
    hideTimeoutRef.current = setTimeout(() => setOverlayVisible(false), 200);
  };

  const showSidebar = locked || overlayVisible || peeking;

  return (
    <>
      {/* Mobile overlay backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Hover zone when unlocked — invisible strip on the left edge */}
      {!locked && (
        <div
          className="hidden lg:block fixed top-20 left-0 z-30 h-[calc(100vh-5rem)]"
          style={{ width: '16px' }}
          onMouseEnter={handleMouseEnter}
        >
          <SidebarToggle locked={false} onToggle={onToggleLock} side="content" />
        </div>
      )}

      {/* Spacer to reserve layout space when locked */}
      {locked && (
        <div className="hidden lg:block flex-shrink-0" style={{ width: '15%', minWidth: '160px' }} />
      )}

      <aside
        className={`
          fixed top-20 left-0 z-50
          h-[calc(100vh-5rem)] overflow-y-auto
          p-3 text-sm
          transition-all duration-200
          ${open ? 'translate-x-0' : (showSidebar ? 'translate-x-0' : '-translate-x-full')}
          ${!locked ? 'shadow-xl' : ''}
        `}
        style={{
          width: '15%',
          minWidth: '160px',
          backgroundColor: 'var(--theme-sidebar-bg)',
          borderRight: '1px solid var(--theme-sidebar-border)',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Lock toggle tab — only in locked mode on desktop */}
        {locked && (
          <div className="hidden lg:block relative">
            <SidebarToggle locked={true} onToggle={onToggleLock} side="sidebar" />
          </div>
        )}

        <div className="lg:hidden flex justify-end mb-2">
          <button
            onClick={onClose}
            className="p-1 rounded transition"
            style={{ backgroundColor: 'var(--theme-hover-bg)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {items.map(course => {
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
                  <div
                    style={{
                      position: 'absolute',
                      left: '-1px',
                      top: '20%',
                      bottom: '20%',
                      width: '3px',
                      borderRadius: '0 3px 3px 0',
                      background: '#3b82f6',
                    }}
                  />
                )}
                <ProgressRing
                  size={20}
                  completed={completed}
                  total={total}
                  isActive={isActive}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs truncate"
                    style={{
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#fff' : (isComplete ? '#16a34a' : 'var(--theme-content-text)'),
                      opacity: !hasProgress && !isActive ? 0.5 : 1,
                    }}
                  >
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
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Breadcrumb from '../common/Breadcrumb';
import ErrorBoundary from '../common/ErrorBoundary';
import { ArrowUp } from 'lucide-react';

export interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  /* ── Responsive sidebar ─────────────────────────────────────── */
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ── Scroll-to-top button visibility ────────────────────────── */
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const onScroll = () => setShowScrollTop(el.scrollTop > 300);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Scroll to top on route change ─────────────────────────── */
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  const scrollToTop = () => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sidebarWidth = sidebarOpen && !isMobile ? 256 : 80;

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Fixed Navbar */}
      <Navbar onMenuClick={toggleSidebar} sidebarOpen={sidebarOpen} />

      {/* Fixed Sidebar */}
      <Sidebar collapsed={!sidebarOpen} onToggle={toggleSidebar} />

      {/* Main scrollable area */}
      <main
        ref={mainRef}
        className="flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300"
        style={{
          marginLeft: sidebarWidth,
          marginTop: 64, /* navbar height */
          height: 'calc(100vh - 64px)',
          scrollBehavior: 'smooth',
        }}
      >
        <div
          className="p-5 lg:p-6 min-h-full"
          style={{ maxWidth: 1440, margin: '0 auto' }}
        >
          <ErrorBoundary>
            <Breadcrumb />
            <div className="mt-4">
              {children || <Outlet />}
            </div>
          </ErrorBoundary>
        </div>
      </main>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 animate-fade-in"
          style={{ background: 'rgba(13,27,62,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Scroll-to-top button */}
      <button
        onClick={scrollToTop}
        className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`}
        data-tooltip="Back to top"
        aria-label="Scroll to top"
        style={{ right: 24, bottom: 24 }}
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
};

export default MainLayout;

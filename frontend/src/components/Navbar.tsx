import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Activity, BarChart2, Upload, Clock, Info, Brain, Menu, X, ChevronRight } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: Activity },
  { name: 'Predict', path: '/predict', icon: Brain },
  { name: 'Analytics', path: '/analytics', icon: BarChart2 },
  { name: 'Upload', path: '/upload', icon: Upload },
  { name: 'History', path: '/history', icon: Clock },
  { name: 'About', path: '/about', icon: Info },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? 'rgba(10,10,10,0.95)'
            : 'linear-gradient(180deg, rgba(10,10,10,0.9) 0%, transparent 100%)',
          backdropFilter: scrolled ? 'blur(16px)' : 'blur(8px)',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        }}
      >
        {/* Brand accent bar */}
        <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #E50914 0%, rgba(229,9,20,0.2) 40%, transparent 100%)' }} />

        <nav className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_8px_rgba(229,9,20,0.5)]">
                <path d="M21.5 10.5C20.25 9.25 18.5 8.5 16 8.5C11.86 8.5 8.5 11.86 8.5 16C8.5 20.14 11.86 23.5 16 23.5C18.5 23.5 20.25 22.75 21.5 21.5" stroke="#E50914" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 8.5V4M16 23.5V28M8.5 16H4M23.5 16H28" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-bold text-white text-base tracking-tight hidden sm:block">
              CCP
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    color: active ? '#fff' : '#9CA3AF',
                    background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.color = '#9CA3AF'; (e.currentTarget as HTMLElement).style.background = 'transparent'; } }}
                >
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full" style={{ background: '#E50914' }} />
                  )}
                  <item.icon size={14} strokeWidth={2} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              API Live
            </div>
            <button
              className="md:hidden btn-icon"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div
            className="absolute top-[57px] left-0 right-0 border-t border-border shadow-card-hover animate-fade-in"
            style={{ background: '#0F0F0F' }}
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all duration-150"
                    style={{
                      color: active ? '#fff' : '#9CA3AF',
                      background: active ? 'rgba(229,9,20,0.1)' : 'transparent',
                      borderLeft: active ? '2px solid #E50914' : '2px solid transparent',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={16} strokeWidth={1.75} />
                      {item.name}
                    </div>
                    {active && <ChevronRight size={14} className="text-brand" />}
                  </Link>
                );
              })}
            </div>
            <div className="px-4 py-3 border-t border-border flex items-center gap-2 text-xs text-textMuted">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              API connected — CatBoost v1.0
            </div>
          </div>
        </div>
      )}
    </>
  );
}

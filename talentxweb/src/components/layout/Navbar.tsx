import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import ThemeToggle from '../common/ThemeToggle';
import NotificationBell from '../common/NotificationBell';
import CommandPalette from '../common/CommandPalette';
import { Search, ChevronDown, User, Settings, LogOut, Menu, X, Command } from 'lucide-react';

interface NavbarProps {
    onMenuClick: () => void;
    sidebarOpen: boolean;
}

/* ─── 3-D TalentX Logo ─────────────────────────────────────────── */
const TalentXLogo3D: React.FC = () => (
    <div
        className="relative select-none"
        style={{ perspective: '300px', width: 44, height: 44 }}
    >
        {/* Outer glow ring */}
        <div
            className="absolute inset-0 rounded-2xl animate-pulse-glow"
            style={{
                background: 'conic-gradient(from 0deg, #FF6B00, #FFD700, #8B5CF6, #2196F3, #FF6B00)',
                padding: 2,
                borderRadius: 14,
            }}
        >
            <div
                className="w-full h-full rounded-[12px]"
                style={{ background: 'var(--sidebar-bg)' }}
            />
        </div>

        {/* 3-D face — main */}
        <div
            className="absolute inset-[3px] rounded-xl center font-black text-sm tracking-tighter overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FF9A3C 45%, #FF6B00 100%)',
                boxShadow: '0 4px 0 #8F3900, 0 8px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4)',
                transform: 'translateY(-2px)',
                transition: 'transform 0.2s ease',
                textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                color: '#fff',
                letterSpacing: '-0.04em',
            }}
        >
            {/* Top highlight */}
            <div
                className="absolute top-0 left-0 right-0 h-1/3 rounded-t-xl"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 100%)' }}
            />
            {/* Bottom shadow */}
            <div
                className="absolute bottom-0 left-0 right-0 h-1/4 rounded-b-xl"
                style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.25) 0%, transparent 100%)' }}
            />
            <span className="relative z-10 font-black" style={{ fontFamily: 'Lexend, sans-serif', fontSize: 13 }}>TX</span>
        </div>

        {/* 3-D bottom edge */}
        <div
            className="absolute left-[3px] right-[3px] rounded-b-xl"
            style={{
                bottom: 1,
                height: 6,
                background: 'linear-gradient(180deg, #8F3900 0%, #662900 100%)',
                borderRadius: '0 0 12px 12px',
            }}
        />
    </div>
);

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, sidebarOpen }) => {
    const { user, logout } = useAuthContext();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const navigate = useNavigate();

    const getUserInitial = () => (user?.email?.charAt(0).toUpperCase()) || 'U';
    const getUserDisplay = () => user?.email?.split('@')[0]?.toUpperCase() || 'USER';
    const getUserEmail = () => user?.email || 'N/A';
    const getUserRole = () => user?.roles?.[0]?.name || 'Personnel';

    return (
        <>
            <nav
                className="fixed top-0 left-0 right-0 h-16 glass-effect z-50 transition-all duration-300"
                style={{ borderBottom: '1px solid var(--navbar-border)' }}
            >
                <div className="h-full px-4 lg:px-8 flex items-center justify-between">

                    {/* ── Left ─────────────────────────────────────────── */}
                    <div className="flex items-center gap-4 lg:gap-6">
                        {/* Hamburger */}
                        <button
                            onClick={onMenuClick}
                            data-tooltip={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
                            className="w-10 h-10 rounded-2xl center transition-all duration-300 focus-ring"
                            style={{
                                background: 'rgba(139,92,246,0.1)',
                                border: '1px solid rgba(139,92,246,0.2)',
                                color: 'var(--violet)',
                            }}
                            aria-label="Toggle sidebar"
                        >
                            {sidebarOpen
                                ? <X className="w-5 h-5 transition-transform duration-300" />
                                : <Menu className="w-5 h-5 transition-transform duration-300" />
                            }
                        </button>

                        {/* Logo */}
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-3 group px-2 py-1 rounded-2xl transition-all"
                            style={{ textDecoration: 'none' }}
                            data-tooltip="Go to Dashboard"
                        >
                            <TalentXLogo3D />
                            <div className="flex flex-col leading-none">
                                <span
                                    className="font-black text-xl tracking-tighter uppercase italic"
                                    style={{
                                        fontFamily: 'Lexend, sans-serif',
                                        background: 'linear-gradient(135deg, #1565C0 0%, #8B5CF6 50%, #FF6B00 100%)',
                                        WebkitBackgroundClip: 'text',
                                        backgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    Talent<span style={{ WebkitTextFillColor: 'var(--saffron)' }}>X</span>
                                </span>
                                <span
                                    className="text-[8px] font-black uppercase tracking-[0.3em] mt-0.5"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    Personnel Strategy
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* ── Center — Search ───────────────────────────────── */}
                    <div className="hidden md:block flex-1 max-w-xl mx-8">
                        <button
                            className="w-full h-11 px-4 pl-12 rounded-2xl flex items-center justify-between group transition-all focus:outline-none relative"
                            style={{
                                background: 'rgba(139,92,246,0.06)',
                                border: '1px solid rgba(139,92,246,0.15)',
                            }}
                            onClick={() => setIsCommandPaletteOpen(true)}
                        >
                            <Search
                                className="absolute left-4 w-4 h-4 transition-colors"
                                style={{ color: 'var(--violet-light)' }}
                            />
                            <span
                                className="text-sm font-medium italic"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Search or run command…
                            </span>
                            <kbd
                                className="hidden lg:inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black tracking-widest"
                                style={{
                                    background: 'rgba(139,92,246,0.12)',
                                    color: 'var(--violet-light)',
                                    border: '1px solid rgba(139,92,246,0.2)',
                                }}
                            >
                                <Command className="w-2.5 h-2.5" /> K
                            </kbd>
                        </button>
                    </div>

                    {/* ── Right ─────────────────────────────────────────── */}
                    <div className="flex items-center gap-3 lg:gap-4">
                        {/* Theme toggle */}
                        <div
                            className="p-1 rounded-2xl"
                            style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}
                        >
                            <ThemeToggle />
                        </div>

                        <div className="w-px h-8" style={{ background: 'var(--border-color)' }} />

                        {/* Notifications */}
                        <NotificationBell userId={user?.id} />

                        {/* Profile */}
                        <div className="relative" onMouseLeave={() => setShowProfileMenu(false)}>
                            <button
                                onMouseEnter={() => setShowProfileMenu(true)}
                                className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-2xl transition-all duration-300"
                                style={{
                                    border: showProfileMenu
                                        ? '1px solid var(--violet)'
                                        : '1px solid var(--border-color)',
                                    background: showProfileMenu
                                        ? 'rgba(139,92,246,0.1)'
                                        : 'transparent',
                                }}
                            >
                                {/* Avatar */}
                                <div
                                    className="w-9 h-9 rounded-xl center font-black text-xs relative overflow-hidden"
                                    style={{
                                        background: 'linear-gradient(135deg, #8B5CF6 0%, #FF6B00 100%)',
                                        color: '#fff',
                                        boxShadow: '0 2px 8px rgba(139,92,246,0.4)',
                                    }}
                                >
                                    {getUserInitial()}
                                    {/* Online dot */}
                                    <div
                                        className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white"
                                        style={{ background: '#22C55E' }}
                                    />
                                </div>
                                <div className="hidden lg:flex flex-col text-left">
                                    <p className="text-xs font-black tracking-tight" style={{ color: 'var(--text-main)' }}>
                                        {getUserDisplay()}
                                    </p>
                                    <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--violet-light)' }}>
                                        {getUserRole()}
                                    </p>
                                </div>
                                <ChevronDown
                                    className={`w-3.5 h-3.5 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`}
                                    style={{ color: 'var(--violet-light)' }}
                                />
                            </button>

                            {/* Dropdown */}
                            {showProfileMenu && (
                                <div
                                    className="absolute right-0 top-[calc(100%+8px)] w-64 rounded-2xl p-2 animate-slide-up z-[100]"
                                    style={{
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid rgba(139,92,246,0.2)',
                                        boxShadow: '0 20px 40px rgba(13,27,62,0.15)',
                                    }}
                                >
                                    {/* Header */}
                                    <div
                                        className="px-4 py-4 mb-2 rounded-xl relative overflow-hidden"
                                        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(255,107,0,0.08) 100%)' }}
                                    >
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--saffron)' }}>
                                            Authenticated
                                        </p>
                                        <p className="text-sm font-black truncate" style={{ color: 'var(--text-main)' }}>
                                            {getUserEmail()}
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            <span
                                                className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest"
                                                style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--violet)', border: '1px solid rgba(139,92,246,0.2)' }}
                                            >
                                                TX-ADMIN
                                            </span>
                                            <span
                                                className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1"
                                                style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}
                                            >
                                                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" /> ACTIVE
                                            </span>
                                        </div>
                                    </div>

                                    {/* Links */}
                                    <div className="space-y-1">
                                        {[
                                            { to: '/profile', icon: <User className="w-4 h-4" />, label: 'My Profile', color: 'var(--violet)' },
                                            { to: '/settings', icon: <Settings className="w-4 h-4" />, label: 'Settings', color: 'var(--blue)' },
                                        ].map(item => (
                                            <Link
                                                key={item.to}
                                                to={item.to}
                                                className="px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all"
                                                style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
                                                onClick={() => setShowProfileMenu(false)}
                                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.06)')}
                                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                            >
                                                <div
                                                    className="w-8 h-8 rounded-lg center transition-all"
                                                    style={{ background: 'rgba(139,92,246,0.08)', color: item.color }}
                                                >
                                                    {item.icon}
                                                </div>
                                                <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>{item.label}</span>
                                            </Link>
                                        ))}
                                    </div>

                                    {/* Logout */}
                                    <div className="pt-2 mt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                                        <button
                                            onClick={() => { setShowProfileMenu(false); logout(); navigate('/login'); }}
                                            className="w-full px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all group/logout"
                                            style={{ color: '#EF4444' }}
                                        >
                                            <div
                                                className="w-8 h-8 rounded-lg center transition-all"
                                                style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
                                            >
                                                <LogOut className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
        </>
    );
};

export default Navbar;

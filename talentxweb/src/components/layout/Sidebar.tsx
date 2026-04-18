import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard, Users, Calendar, Palmtree, CircleDollarSign,
  Target, BarChart3, ChevronLeft, UserPlus, ClipboardList, FileText,
  History, Settings, Building2, MapPin, Search, GraduationCap, Award,
  Clock, Laptop, CreditCard, HeartPulse, ShieldCheck, Lock, Monitor,
  ChevronDown,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  roles?: string[];
  children?: MenuItem[];
}

const SECTION_ACCENTS: Record<string, string> = {
  dashboard: 'var(--yellow)',
  core: 'var(--blue)',
  talent: 'var(--violet)',
  operations: 'var(--saffron)',
  finance: 'var(--yellow)',
  governance: 'var(--blue)',
  system: 'var(--violet)',
  reports: 'var(--saffron)',
};

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const { hasRole } = useAuth();

  const canSee = (roles?: string[]): boolean => {
    if (!roles || roles.length === 0) return true;
    return roles.some(r => hasRole(r));
  };

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard' },
    {
      id: 'core', label: 'Core Management', icon: 'Users', path: '/employees',
      roles: ['ADMIN', 'HR', 'MANAGER'],
      children: [
        { id: 'employees-list', label: 'All Employees', icon: 'Users', path: '/employees', roles: ['ADMIN', 'HR', 'MANAGER'] },
        { id: 'departments', label: 'Departments', icon: 'Building2', path: '/departments', roles: ['ADMIN', 'HR'] },
        { id: 'locations', label: 'Locations', icon: 'MapPin', path: '/locations', roles: ['ADMIN', 'HR'] },
      ],
    },
    {
      id: 'talent', label: 'Talent & Growth', icon: 'Target', path: '/performance',
      children: [
        { id: 'job-postings', label: 'Job Postings', icon: 'Search', path: '/recruitment', roles: ['ADMIN', 'HR', 'RECRUITER'] },
        { id: 'interviews', label: 'Interview Schedule', icon: 'Calendar', path: '/recruitment/interviews', roles: ['ADMIN', 'HR', 'RECRUITER'] },
        { id: 'candidates', label: 'Candidate Evaluation', icon: 'ClipboardList', path: '/recruitment/candidates', roles: ['ADMIN', 'HR', 'RECRUITER'] },
        { id: 'performance', label: 'Performance', icon: 'Target', path: '/performance' },
        { id: 'training', label: 'Training', icon: 'GraduationCap', path: '/training' },
        { id: 'skills', label: 'Skills & Matrix', icon: 'Award', path: '/skills' },
      ],
    },
    {
      id: 'operations', label: 'Operations', icon: 'Calendar', path: '/attendance',
      children: [
        { id: 'attendance', label: 'Attendance', icon: 'Clock', path: '/attendance' },
        { id: 'leave', label: 'Leave & Holidays', icon: 'Palmtree', path: '/leave' },
        { id: 'assets', label: 'Inventory Control', icon: 'Laptop', path: '/assets', roles: ['ADMIN', 'HR', 'MANAGER'] },
        { id: 'asset-assignments', label: 'Asset Assignments', icon: 'Monitor', path: '/assets/assignments', roles: ['ADMIN', 'HR', 'MANAGER'] },
        { id: 'expenses', label: 'Expenses', icon: 'CreditCard', path: '/expenses' },
      ],
    },
    {
      id: 'finance', label: 'Finance & Payroll', icon: 'CircleDollarSign', path: '/payroll',
      roles: ['ADMIN', 'HR', 'PAYROLL'],
      children: [
        { id: 'payroll-runs', label: 'Payroll Runs', icon: 'History', path: '/payroll/runs', roles: ['ADMIN', 'HR', 'PAYROLL'] },
        { id: 'tax-declaration', label: 'Tax Declaration', icon: 'FileText', path: '/payroll/tax-declaration', roles: ['ADMIN', 'HR', 'PAYROLL'] },
        { id: 'benefits', label: 'Benefits', icon: 'HeartPulse', path: '/benefits', roles: ['ADMIN', 'HR'] },
      ],
    },
    {
      id: 'governance', label: 'Governance', icon: 'ShieldCheck', path: '/compliance',
      roles: ['ADMIN', 'HR'],
      children: [
        { id: 'compliance', label: 'Compliance', icon: 'ShieldCheck', path: '/compliance', roles: ['ADMIN', 'HR'] },
        { id: 'documents', label: 'Documents', icon: 'FileText', path: '/documents' },
        { id: 'audit', label: 'Audit Logs', icon: 'History', path: '/audit', roles: ['ADMIN', 'HR'] },
      ],
    },
    {
      id: 'system', label: 'System Settings', icon: 'Settings', path: '/users',
      roles: ['ADMIN'],
      children: [
        { id: 'user-management', label: 'User Management', icon: 'UserPlus', path: '/users', roles: ['ADMIN'] },
        { id: 'role-permissions', label: 'Roles & Permissions', icon: 'Lock', path: '/roles', roles: ['ADMIN'] },
        { id: 'system-settings', label: 'General Settings', icon: 'Settings', path: '/settings', roles: ['ADMIN'] },
      ],
    },
    { id: 'reports', label: 'Reports', icon: 'BarChart3', path: '/reports', roles: ['ADMIN', 'HR', 'MANAGER'] },
  ];

  const getIcon = (iconName: string, color?: string) => {
    const cls = 'w-4 h-4 flex-shrink-0';
    const style = color ? { color } : {};
    const props = { className: cls, style };
    switch (iconName) {
      case 'LayoutDashboard': return <LayoutDashboard {...props} />;
      case 'Users': return <Users {...props} />;
      case 'Calendar': return <Calendar {...props} />;
      case 'Palmtree': return <Palmtree {...props} />;
      case 'CircleDollarSign': return <CircleDollarSign {...props} />;
      case 'Target': return <Target {...props} />;
      case 'BarChart3': return <BarChart3 {...props} />;
      case 'UserPlus': return <UserPlus {...props} />;
      case 'ClipboardList': return <ClipboardList {...props} />;
      case 'FileText': return <FileText {...props} />;
      case 'History': return <History {...props} />;
      case 'Settings': return <Settings {...props} />;
      case 'Building2': return <Building2 {...props} />;
      case 'MapPin': return <MapPin {...props} />;
      case 'Search': return <Search {...props} />;
      case 'GraduationCap': return <GraduationCap {...props} />;
      case 'Award': return <Award {...props} />;
      case 'Clock': return <Clock {...props} />;
      case 'Laptop': return <Laptop {...props} />;
      case 'CreditCard': return <CreditCard {...props} />;
      case 'HeartPulse': return <HeartPulse {...props} />;
      case 'ShieldCheck': return <ShieldCheck {...props} />;
      case 'Lock': return <Lock {...props} />;
      case 'Monitor': return <Monitor {...props} />;
      default: return <BarChart3 {...props} />;
    }
  };

  const toggleSubmenu = (menuId: string) =>
    setExpandedMenus(prev =>
      prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId]
    );

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
  const isExpanded = (menuId: string) => expandedMenus.includes(menuId);

  return (
    <aside
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] transition-all duration-300 z-40 flex flex-col ${collapsed ? 'w-20' : 'w-64'}`}
      style={{
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.25)',
      }}
    >
      {/* Rainbow top accent bar */}
      <div
        className="h-0.5 w-full flex-shrink-0"
        style={{ background: 'linear-gradient(90deg, var(--saffron), var(--yellow), var(--violet), var(--blue))' }}
      />

      {/* Scrollable menu area */}
      <div className="flex flex-col flex-1 py-3 px-2 overflow-y-auto sidebar-scroll">
        <ul className="space-y-0.5">
          {menuItems.filter(item => canSee(item.roles)).map((item) => {
            const active = isActive(item.path);
            const expanded = isExpanded(item.id);
            const accent = SECTION_ACCENTS[item.id] || 'var(--violet-light)';
            const visibleChildren = item.children?.filter(c => canSee(c.roles));

            return (
              <li key={item.id}>
                {visibleChildren && visibleChildren.length > 0 ? (
                  <>
                    {/* Parent button — tooltip when collapsed */}
                    <button
                      onClick={() => toggleSubmenu(item.id)}
                      {...(collapsed ? { 'data-tooltip-right': item.label } : {})}
                      className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all duration-200 group"
                      style={{
                        background: active
                          ? `linear-gradient(135deg, ${accent}22 0%, ${accent}11 100%)`
                          : expanded
                            ? 'rgba(255,255,255,0.06)'
                            : 'transparent',
                        border: active ? `1px solid ${accent}44` : '1px solid transparent',
                        textDecoration: 'none',
                      }}
                    >
                      {/* Icon bubble */}
                      <div
                        className="w-8 h-8 rounded-lg center flex-shrink-0 transition-all duration-200"
                        style={{
                          background: active ? accent : 'rgba(255,255,255,0.08)',
                          boxShadow: active ? `0 0 10px ${accent}55` : 'none',
                          minWidth: 32,
                        }}
                      >
                        {getIcon(item.icon, active ? '#fff' : accent)}
                      </div>

                      {!collapsed && (
                        <>
                          <span
                            className="flex-1 text-left text-sm font-semibold"
                            style={{ color: active ? '#fff' : 'var(--sidebar-text)' }}
                          >
                            {item.label}
                          </span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-300 flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
                            style={{ color: accent }}
                          />
                        </>
                      )}
                    </button>

                    {/* Children */}
                    {!collapsed && expanded && (
                      <ul
                        className="mt-0.5 ml-3 space-y-0.5 animate-slide-up"
                        style={{ borderLeft: `2px solid ${accent}33`, paddingLeft: 8 }}
                      >
                        {visibleChildren.map((child) => {
                          const childActive = location.pathname === child.path;
                          return (
                            <li key={child.id}>
                              <Link
                                to={child.path}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                                style={{
                                  textDecoration: 'none',
                                  background: childActive ? `${accent}1A` : 'transparent',
                                  color: childActive ? '#fff' : 'var(--sidebar-text-muted)',
                                  borderLeft: childActive ? `2px solid ${accent}` : '2px solid transparent',
                                  marginLeft: -2,
                                }}
                                onMouseEnter={e => {
                                  if (!childActive) {
                                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                                    (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)';
                                  }
                                }}
                                onMouseLeave={e => {
                                  if (!childActive) {
                                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                                    (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-text-muted)';
                                  }
                                }}
                              >
                                {getIcon(child.icon, childActive ? accent : 'var(--sidebar-text-muted)')}
                                <span>{child.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                ) : !item.children ? (
                  /* Leaf link — tooltip when collapsed */
                  <Link
                    to={item.path}
                    {...(collapsed ? { 'data-tooltip-right': item.label } : {})}
                    className="flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all duration-200"
                    style={{
                      textDecoration: 'none',
                      background: active
                        ? `linear-gradient(135deg, ${accent}2E 0%, ${accent}18 100%)`
                        : 'transparent',
                      border: active ? `1px solid ${accent}44` : '1px solid transparent',
                    }}
                    onMouseEnter={e => {
                      if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                    }}
                    onMouseLeave={e => {
                      if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg center flex-shrink-0 transition-all duration-200"
                      style={{
                        background: active ? accent : 'rgba(255,255,255,0.08)',
                        boxShadow: active ? `0 0 10px ${accent}55` : 'none',
                        minWidth: 32,
                      }}
                    >
                      {getIcon(item.icon, active ? '#fff' : accent)}
                    </div>
                    {!collapsed && (
                      <span
                        className="text-sm font-semibold"
                        style={{ color: active ? '#fff' : 'var(--sidebar-text)' }}
                      >
                        {item.label}
                      </span>
                    )}
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>

        {/* Spacer */}
        <div className="flex-1 min-h-4" />

        {/* Collapse toggle */}
        <div
          className="pt-3 mt-2"
          style={{ borderTop: '1px solid var(--sidebar-border)' }}
        >
          <button
            onClick={onToggle}
            data-tooltip-right={collapsed ? 'Expand Sidebar' : undefined}
            className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all duration-200"
            style={{ color: 'var(--sidebar-text-muted)', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div
              className="w-8 h-8 rounded-lg center flex-shrink-0 transition-transform duration-300"
              style={{
                background: 'rgba(255,255,255,0.08)',
                transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                minWidth: 32,
              }}
            >
              <ChevronLeft className="w-4 h-4" style={{ color: 'var(--violet-light)' }} />
            </div>
            {!collapsed && (
              <span className="text-sm font-semibold">Collapse</span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

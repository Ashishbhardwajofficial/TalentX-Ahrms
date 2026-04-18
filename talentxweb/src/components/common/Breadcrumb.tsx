import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const location = useLocation();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Dashboard', path: '/dashboard' }];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = segment
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      const isLast = index === pathSegments.length - 1;
      breadcrumbs.push(isLast ? { label } : { label, path: currentPath });
    });

    return breadcrumbs;
  };

  const crumbs = items || generateBreadcrumbs();

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 mb-5 flex-wrap"
    >
      {crumbs.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight
              className="w-3.5 h-3.5 flex-shrink-0"
              style={{ color: 'var(--text-muted)', opacity: 0.5 }}
            />
          )}

          {item.path ? (
            <Link
              to={item.path}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                textDecoration: 'none',
                color: 'var(--violet)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.08)';
                (e.currentTarget as HTMLElement).style.color = 'var(--violet-dark)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'var(--violet)';
              }}
            >
              {index === 0 && <Home className="w-3.5 h-3.5" />}
              <span>{item.label}</span>
            </Link>
          ) : (
            <span
              className="px-2 py-1 text-sm font-semibold rounded-lg"
              style={{
                color: 'var(--text-main)',
                background: 'rgba(139,92,246,0.06)',
              }}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;

import { useLocation } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path: string;
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Acasă', path: '/' }
  ];

  const pathMap: Record<string, string> = {
    'dashboard': 'Tablou de Bord',
    'business': 'Gestionare Business',
    'documents': 'Documente',
    'reconciliation': 'Reconciliere',
    'analytics': 'Analiză & Rapoarte',
    'settings': 'Setări',
    'setup': 'Configurare Inițială',
    'accounting': 'Contabilitate',
    'declarations': 'Declarații',
    'tax-optimization': 'Optimizare Fiscală',
    'compliance': 'Conformitate',
    'alerts': 'Alerte'
  };

  let currentPath = '';
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    const label = pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({ label, path: currentPath });
  });

  return breadcrumbs;
}

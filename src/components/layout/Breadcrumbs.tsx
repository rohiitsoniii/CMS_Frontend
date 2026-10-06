import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ElementType;
}

interface BreadcrumbsProps {
    items?: BreadcrumbItem[];
    className?: string;
    showHome?: boolean;
}

export function Breadcrumbs({ items, className, showHome = true }: BreadcrumbsProps) {
    const location = useLocation();
    const { projectId } = useParams();

    // If explicit items are provided, use them
    let displayItems: BreadcrumbItem[] = [];

    if (items && items.length > 0) {
        displayItems = items;
    } else {
        // Auto-generate from pathname
        const segments = location.pathname.split('/').filter(Boolean);
        let accumulatedPath = '';

        displayItems = segments.map((seg, idx) => {
            accumulatedPath += `/${seg}`;
            
            // Format labels nicely
            let label = seg;
            if (seg === 'dashboard') label = 'Dashboard';
            else if (seg === 'project' || seg === 'projects') label = 'Projects';
            else if (seg === projectId) label = 'Project';
            else if (seg === 'content-types') label = 'Content Models';
            else if (seg === 'locales') label = 'Locales & i18n';
            else if (seg === 'rag-bots') label = 'RAG Bots';
            else if (seg === 'email-templates') label = 'Email Templates';
            else if (seg === 'api-keys') label = 'API Keys';
            else if (seg === 'audit-logs') label = 'Audit Logs';
            else if (seg === 'new') label = 'Create New';
            else if (seg === 'edit') label = 'Edit';
            else {
                // Capitalize and replace hyphens
                label = seg.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
            }

            const isLast = idx === segments.length - 1;
            return {
                label,
                href: isLast ? undefined : accumulatedPath,
            };
        });
    }

    if (displayItems.length === 0) return null;

    return (
        <nav
            aria-label="Breadcrumb"
            className={cn('flex items-center space-x-1.5 text-xs text-muted-foreground', className)}
        >
            {showHome && (
                <div className="flex items-center">
                    <Link
                        to="/dashboard"
                        aria-label="Go to Dashboard"
                        className="inline-flex items-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                        <Home className="w-3.5 h-3.5" />
                    </Link>
                    <ChevronRight className="w-3 h-3 mx-1 text-gray-400 dark:text-gray-600 shrink-0" aria-hidden="true" />
                </div>
            )}

            {displayItems.map((item, index) => {
                const isLast = index === displayItems.length - 1;
                const Icon = item.icon;

                return (
                    <div key={`${item.label}-${index}`} className="flex items-center">
                        {item.href && !isLast ? (
                            <Link
                                to={item.href}
                                className="inline-flex items-center font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors truncate max-w-[160px]"
                            >
                                {Icon && <Icon className="w-3.5 h-3.5 mr-1 shrink-0" />}
                                <span>{item.label}</span>
                            </Link>
                        ) : (
                            <span
                                className="inline-flex items-center font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[200px]"
                                aria-current={isLast ? 'page' : undefined}
                            >
                                {Icon && <Icon className="w-3.5 h-3.5 mr-1 shrink-0 text-indigo-500" />}
                                <span>{item.label}</span>
                            </span>
                        )}

                        {!isLast && (
                            <ChevronRight className="w-3 h-3 mx-1 text-gray-400 dark:text-gray-600 shrink-0" aria-hidden="true" />
                        )}
                    </div>
                );
            })}
        </nav>
    );
}

export default Breadcrumbs;

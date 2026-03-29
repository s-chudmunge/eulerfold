import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 mb-6 text-[12px] font-bold inconsolata-ui" aria-label="Breadcrumb">
      <Link 
        href="/" 
        className="text-text-muted hover:text-text-heading transition-colors flex items-center"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3 h-3 text-text-muted/40 shrink-0" />
          {item.href ? (
            <Link 
              href={item.href}
              className="text-text-muted hover:text-text-heading transition-colors whitespace-nowrap"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-teal-600 truncate">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

import React from 'react';

const PRIORITY_STYLES = {
  LOW: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  MEDIUM: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  HIGH: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  URGENT: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
  CRITICAL: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200 font-bold' },
};

export const PriorityBadge = ({ priority = 'MEDIUM', className = '' }) => {
  const norm = priority ? String(priority).toUpperCase() : 'MEDIUM';
  const config = PRIORITY_STYLES[norm] || PRIORITY_STYLES.MEDIUM;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {priority}
    </span>
  );
};


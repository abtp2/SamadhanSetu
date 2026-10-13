import React from 'react';

const PRIORITY_STYLES = {
  LOW: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200 font-normal' },
  MEDIUM: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300 font-medium' },
  HIGH: { bg: 'bg-gov-800', text: 'text-white', border: 'border-gov-800 font-semibold' },
  URGENT: { bg: 'bg-gov-900', text: 'text-white', border: 'border-gov-900 font-bold' },
  CRITICAL: { bg: 'bg-gov-950', text: 'text-white', border: 'border-gov-950 font-bold' },
};

export const PriorityBadge = ({ priority = 'MEDIUM', className = '' }) => {
  const norm = priority ? String(priority).toUpperCase() : 'MEDIUM';
  const config = PRIORITY_STYLES[norm] || PRIORITY_STYLES.MEDIUM;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] tracking-wide uppercase border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {priority}
    </span>
  );
};

import React from 'react';

const STATUS_STYLES = {
  SUBMITTED: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', label: 'Submitted' },
  AI_ANALYZED: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', label: 'AI Analyzed' },
  UNDER_REVIEW: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', label: 'Under Review' },
  VERIFIED: { bg: 'bg-gov-900', text: 'text-white', border: 'border-gov-900', label: 'Verified' },
  ASSIGNED: { bg: 'bg-gov-800', text: 'text-white', border: 'border-gov-800', label: 'Assigned' },
  IN_PROGRESS: { bg: 'bg-slate-200', text: 'text-slate-800', border: 'border-slate-300', label: 'In Progress' },
  SOLUTION_SUBMITTED: { bg: 'bg-slate-200', text: 'text-slate-800', border: 'border-slate-300', label: 'Solution Sent' },
  PILOTING: { bg: 'bg-slate-200', text: 'text-slate-900', border: 'border-slate-400 font-semibold', label: 'Piloting' },
  IMPLEMENTED: { bg: 'bg-slate-100', text: 'text-slate-900', border: 'border-slate-400 font-semibold', label: 'Implemented' },
  RESOLVED: { bg: 'bg-slate-100', text: 'text-slate-900', border: 'border-slate-400 font-semibold', label: 'Resolved' },
};

export const StatusBadge = ({ status, className = '' }) => {
  const normalizedKey = status ? String(status).toUpperCase().replace(/\s+/g, '_') : 'SUBMITTED';
  const config = STATUS_STYLES[normalizedKey] || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    label: status || 'Pending',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {config.label}
    </span>
  );
};

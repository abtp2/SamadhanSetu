import React from 'react';

const STATUS_STYLES = {
  SUBMITTED: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', label: 'Submitted' },
  AI_ANALYZED: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', label: 'AI Analyzed' },
  UNDER_REVIEW: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Under Review' },
  VERIFIED: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', label: 'Verified' },
  ASSIGNED: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', label: 'Assigned' },
  IN_PROGRESS: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'In Progress' },
  SOLUTION_SUBMITTED: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', label: 'Solution Sent' },
  PILOTING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Piloting' },
  IMPLEMENTED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Implemented' },
  RESOLVED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Resolved' },
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
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {config.label}
    </span>
  );
};


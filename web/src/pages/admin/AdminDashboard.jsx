import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import {
  FileCheck,
  Building2,
  GraduationCap,
  MapPin,
  BarChart3,
  Award,
  Layers
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [queue, setQueue] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, queueRes, projRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/admin/verification-queue'),
          api.get('/projects?limit=5'),
        ]);

        if (statsRes.success) setMetrics(statsRes.metrics);
        if (queueRes.success) setQueue(queueRes.challenges || []);
        if (projRes.success) setActiveProjects(projRes.projects || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const adminMetrics = [
    {
      title: 'Total Issues',
      value: metrics?.totalChallenges ?? queue.length,
      icon: BarChart3,
    },
    {
      title: 'AI Verified',
      value: queue.filter((c) => c.status === 'VERIFIED' || c.isAiVerified).length,
      icon: Layers,
    },
    {
      title: 'Active Projects',
      value: metrics?.activeProjects ?? activeProjects.length,
      icon: GraduationCap,
    },
    {
      title: 'CSR Committed',
      value: `₹${((metrics?.totalFundsCommitted || 0) / 100000).toFixed(1)}L`,
      icon: Award,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Admin Command Center</h1>
          <p className="text-xs text-slate-500">Welcome, {user?.name}</p>
        </div>

        <Link
          to="/admin/verification"
          className="inline-flex items-center space-x-1.5 bg-gov-900 hover:bg-gov-800 text-white font-medium px-3.5 py-1.5 rounded text-xs transition-colors"
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Issues & Work ({queue.length})</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {adminMetrics.map((m) => (
          <div
            key={m.title}
            className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">
                {m.title}
              </span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">
                {m.value}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <m.icon className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Challenges */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Reported Issues
          </h2>
          <Link to="/admin/verification" className="text-xs text-slate-600 hover:text-slate-900 font-medium">
            View All ({queue.length}) →
          </Link>
        </div>

        {queue.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No issues currently reported.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {queue.slice(0, 5).map((c) => (
              <div
                key={c._id}
                className="p-3 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5 max-w-2xl">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-500 font-semibold uppercase text-[10px]">{c.category}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">{c.district}</span>
                    <PriorityBadge priority={c.priority} />
                  </div>
                  <h3 className="font-semibold text-slate-900">
                    {c.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{c.location}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <StatusBadge status={c.status} />
                  <Link
                    to="/admin/verification"
                    className="text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded transition-colors"
                  >
                    Inspect →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active University Projects Monitoring */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Active University Projects
          </h2>
          <Link to="/analytics" className="text-xs text-slate-600 hover:text-slate-900 font-medium">
            Analytics →
          </Link>
        </div>

        {activeProjects.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No active university projects running.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activeProjects.map((p) => (
              <div
                key={p._id}
                className="p-3 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5 max-w-2xl">
                  <div className="flex items-center space-x-2 text-[11px]">
                    <span className="font-medium text-slate-800">{p.university?.name || 'Partner University'}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">{p.challenge?.district || 'Jharkhand'}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      Phase: {p.currentPhase || 'Active'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900">
                    {p.title}
                  </h3>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <Link
                    to={`/projects/${p._id}`}
                    className="text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded transition-colors"
                  >
                    Workspace →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

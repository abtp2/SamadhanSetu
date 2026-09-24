import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import {
  ShieldCheck,
  FileCheck,
  Building2,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Users,
  CheckCircle2,
  BarChart3,
  Clock,
  Award,
  FileText
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
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const adminMetrics = [
    {
      title: 'TOTAL CHALLENGES',
      value: metrics?.totalChallenges ?? 0,
      sub: 'All districts crowdsourced',
      icon: BarChart3,
    },
    {
      title: 'AWAITING TRIAGE',
      value: queue.length,
      sub: 'Pending state review',
      icon: Clock,
    },
    {
      title: 'ACTIVE TASKFORCES',
      value: metrics?.activeProjects ?? 0,
      sub: 'University teams',
      icon: GraduationCap,
    },
    {
      title: 'CSR CAPITAL RAISED',
      value: `₹${((metrics?.totalFundsCommitted || 0) / 100000).toFixed(1)}L`,
      sub: 'Committed industry grants',
      icon: Award,
    },
  ];

  return (
    <div className="space-y-6">
      {/* State Admin Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-gov-800 uppercase tracking-wider">
              State Government Command Center
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-semibold">Higher Education & IT Dept, Jharkhand</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">Welcome, {user?.name}</h1>
          <p className="text-xs text-slate-500">
            Validate citizen reports with AI assistance, coordinate university taskforces, and measure district-level implementation impact.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/admin/verification"
            className="inline-flex items-center space-x-1.5 bg-gov-900 hover:bg-gov-800 text-white font-semibold px-4 py-2 rounded text-xs transition-colors shadow-xs"
          >
            <FileCheck className="w-4 h-4" />
            <span>Open Verification Queue ({queue.length})</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {adminMetrics.map((m) => (
          <div
            key={m.title}
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-gov-900 flex items-center justify-center">
                <m.icon className="w-4.5 h-4.5 text-gov-900" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {m.title}
              </span>
            </div>

            <p className="text-2xl sm:text-3xl font-extrabold text-gov-900 mt-1">
              {m.value}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Verification Queue Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-gov-800" />
              <span>Pending Verification Queue ({queue.length})</span>
            </h2>
            <p className="text-[11px] text-slate-500">Citizen submissions awaiting official state administrative triage.</p>
          </div>
          <Link to="/admin/verification" className="text-xs text-gov-800 font-semibold hover:underline">
            Process All ({queue.length}) →
          </Link>
        </div>

        {queue.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Verification queue is empty. All challenges are currently processed!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {queue.slice(0, 4).map((c) => (
              <div
                key={c._id}
                className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center space-x-2 text-[11px]">
                    <span className="font-semibold text-gov-800 uppercase">{c.category}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">{c.district}</span>
                    <PriorityBadge priority={c.priority || c.urgency} />
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                      AI Severity: {c.aiAnalysis?.severityScore || 6}/10
                    </span>
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm text-slate-900 leading-snug">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{c.location}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <StatusBadge status={c.status} />
                  <Link
                    to="/admin/verification"
                    className="text-xs font-semibold text-gov-800 hover:text-gov-900 bg-white border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded transition-colors shadow-xs"
                  >
                    Triage & Verify →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active University Projects Monitoring */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Active University Innovation Taskforces ({activeProjects.length})
            </h2>
            <p className="text-[11px] text-slate-500">Multidisciplinary teams solving verified Jharkhand challenges.</p>
          </div>
          <Link to="/analytics" className="text-xs text-gov-800 font-semibold hover:underline">
            View Analytics →
          </Link>
        </div>

        {activeProjects.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No active university taskforces currently running.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activeProjects.map((p) => (
              <div
                key={p._id}
                className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center space-x-2 text-[11px]">
                    <span className="font-semibold text-gov-800">{p.university?.name || 'Partner University'}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">{p.challenge?.district || 'Jharkhand'}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800">
                      Phase: {p.currentPhase || 'Active'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm text-slate-900 leading-snug">
                    {p.title}
                  </h3>
                  <div className="pt-0.5 flex items-center space-x-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{p.university?.name || 'University'}</span>
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-gov-800 font-medium">
                      CSR Funded: ₹{(p.budgetFunded || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <Link
                    to={`/projects/${p._id}`}
                    className="text-xs font-semibold text-gov-800 hover:text-gov-900 bg-white border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded transition-colors shadow-xs"
                  >
                    Audit Project →
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

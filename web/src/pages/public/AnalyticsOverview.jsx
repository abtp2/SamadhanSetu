import React, { useState, useEffect } from 'react';
import { api } from '../../api/apiClient';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, TrendingUp, Users, CheckCircle2, Building2, MapPin, GraduationCap, Award } from 'lucide-react';

export const AnalyticsOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-16 text-xs text-slate-500">Loading state analytics...</div>;
  }

  const metrics = data?.metrics || {};
  const categoryDist = data?.categoryDistribution || [];
  const districtDist = data?.districtDistribution || [];

  const topMetrics = [
    {
      title: 'TOTAL CHALLENGES',
      value: metrics.totalChallenges ?? 0,
      sub: 'Crowdsourced problems',
      icon: BarChart3,
    },
    {
      title: 'VERIFICATION RATE',
      value: `${metrics.totalChallenges > 0 ? Math.round(((metrics.verifiedChallenges || 0) / metrics.totalChallenges) * 100) : 0}%`,
      sub: 'Admin validated',
      icon: CheckCircle2,
    },
    {
      title: 'ACTIVE TASKFORCES',
      value: metrics.activeProjects ?? 0,
      sub: 'University teams',
      icon: GraduationCap,
    },
    {
      title: 'CSR CAPITAL RAISED',
      value: `₹${((metrics.totalFundsCommitted || 0) / 100000).toFixed(1)}L`,
      sub: 'Industry grants',
      icon: Award,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div>
        <div className="inline-flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full text-xs font-semibold text-gov-900 border border-blue-200/60 mb-2">
          <span>State Civic Intelligence</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Jharkhand Impact Analytics</h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          Quantifiable tracking of crowdsourced challenges, university adoption rates, and CSR capital deployment across Jharkhand.
        </p>
      </div>

      {/* Top Aggregates (Unified Navy & Soft-Blue Palette) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {topMetrics.map((m) => (
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

      {/* Charts 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Category Distribution
            </h3>
            <p className="text-[11px] text-slate-500">Challenges classified by societal sector</p>
          </div>

          <div className="h-64 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDist} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 10, fill: '#475569' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#475569' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0f2c59" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* District Distribution Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              District Distribution
            </h3>
            <p className="text-[11px] text-slate-500">Geographic footprint across Jharkhand key zones</p>
          </div>

          <div className="h-64 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtDist} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#475569' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lifecycle Progress Funnel */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-2">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
            Active University Solution Phases
          </h3>
          <p className="text-[11px] text-slate-500">Pipeline progression of adopted challenges</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-[10px] uppercase font-bold text-slate-500">Research & Baseline</span>
            <p className="text-xl font-bold text-gov-900 mt-1">1 Project</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-[10px] uppercase font-bold text-slate-500">Bench Prototyping</span>
            <p className="text-xl font-bold text-gov-900 mt-1">1 Project</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-[10px] uppercase font-bold text-slate-500">Ground Piloting</span>
            <p className="text-xl font-bold text-gov-900 mt-1">1 Project</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-[10px] uppercase font-bold text-slate-500">Resolved & Handover</span>
            <p className="text-xl font-bold text-gov-900 mt-1">2 Projects</p>
          </div>
        </div>
      </div>
    </div>
  );
};

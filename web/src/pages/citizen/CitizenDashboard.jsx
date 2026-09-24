import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import {
  PlusCircle,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Users,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';

export const CitizenDashboard = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyChallenges = async () => {
      try {
        const res = await api.get('/challenges/my');
        if (res.success) {
          setChallenges(res.challenges || []);
        }
      } catch (err) {
        console.error('Fetch my challenges error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyChallenges();
  }, []);

  const total = challenges.length;
  const reviewing = challenges.filter(c => ['SUBMITTED', 'AI_ANALYZED', 'UNDER_REVIEW'].includes(c.status)).length;
  const inProgress = challenges.filter(c => ['IN_PROGRESS', 'SOLUTION_SUBMITTED', 'PILOTING'].includes(c.status)).length;
  const resolved = challenges.filter(c => ['IMPLEMENTED', 'RESOLVED'].includes(c.status)).length;

  const citizenMetrics = [
    {
      title: 'TOTAL REPORTED',
      value: total,
      sub: 'Your submissions',
      icon: FileText,
    },
    {
      title: 'UNDER REVIEW',
      value: reviewing,
      sub: 'By local authorities',
      icon: Clock,
    },
    {
      title: 'IN PROGRESS',
      value: inProgress,
      sub: 'University teams',
      icon: GraduationCap,
    },
    {
      title: 'RESOLVED',
      value: resolved,
      sub: 'Piloted on ground',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-gov-800 uppercase tracking-wider">
              Citizen Civic Portal
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-semibold">{user?.district || 'Jharkhand'}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">Welcome, {user?.name}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track the live status and resolution progress of your neighborhood issues.
          </p>
        </div>
        <Link
          to="/citizen/report"
          className="inline-flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded text-xs transition-colors shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Issue</span>
        </Link>
      </div>

      {/* Metric Cards (Unified Navy / Soft-Blue Palette) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {citizenMetrics.map((m) => (
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

      {/* Submissions Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            My Submitted Challenges ({total})
          </h2>
          <Link to="/citizen/my-challenges" className="text-xs text-gov-800 font-semibold hover:underline">
            View All Submissions
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading your reports...</div>
        ) : challenges.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">You haven't reported any challenges yet.</p>
            <Link
              to="/citizen/report"
              className="inline-block text-xs font-semibold text-gov-800 hover:underline"
            >
              Submit your first challenge →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {challenges.map((c) => (
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
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm text-slate-900 leading-snug">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{c.location}</span>
                  </p>
                  {c.project && (
                    <div className="pt-1 flex items-center space-x-2 text-xs text-gov-800 font-medium">
                      <span>Adopted Project Phase:</span>
                      <span className="font-semibold capitalize text-slate-800">{c.project.currentPhase || 'Active'}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <StatusBadge status={c.status} />
                  <Link
                    to={`/challenges/${c._id}`}
                    className="text-xs font-semibold text-gov-800 hover:text-gov-900 bg-white border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded transition-colors shadow-xs"
                  >
                    View Status →
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

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
  MapPin,
  GraduationCap
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
        console.error('Fetch error:', err);
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
    { title: 'Reported', value: total, icon: FileText },
    { title: 'Under Review', value: reviewing, icon: Clock },
    { title: 'In Progress', value: inProgress, icon: GraduationCap },
    { title: 'Resolved', value: resolved, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner with Yellow Report Issue Button */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Welcome, {user?.name}</h1>
          <p className="text-xs text-slate-500">{user?.district || 'Jharkhand'} • Citizen Portal</p>
        </div>
        <Link
          to="/citizen/report"
          className="inline-flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded text-xs transition-colors shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Issue</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {citizenMetrics.map((m) => (
          <div
            key={m.title}
            className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">{m.title}</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{m.value}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <m.icon className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            My Submissions ({total})
          </h2>
          <Link to="/citizen/my-challenges" className="text-xs text-slate-600 hover:text-slate-900 font-medium">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading...</div>
        ) : challenges.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-xs text-slate-500">You haven't reported any issues yet.</p>
            <Link
              to="/citizen/report"
              className="inline-flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded text-xs transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Issue</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {challenges.slice(0, 5).map((c) => (
              <div key={c._id} className="p-3 hover:bg-slate-50 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5 max-w-xl">
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-slate-500 uppercase font-semibold">{c.category}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">{c.district}</span>
                    <PriorityBadge priority={c.priority} />
                  </div>
                  <h3 className="font-semibold text-slate-900">{c.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={c.status} />
                  <Link
                    to={`/challenges/${c._id}`}
                    className="text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded"
                  >
                    Details →
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

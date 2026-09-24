import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { PlusCircle, MapPin, Calendar, ExternalLink, FileText, ArrowRight } from 'lucide-react';

export const MyChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
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

    fetchChallenges();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">My Submitted Challenges</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status updates on all challenges you have reported to SamadhanSetu.
          </p>
        </div>
        <Link
          to="/citizen/report"
          className="inline-flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded text-xs transition-colors shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Another Issue</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading your submissions...</div>
        ) : challenges.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-xs font-semibold text-slate-800">No challenges submitted yet</h3>
            <p className="text-xs text-slate-500">Submit a neighborhood problem to trigger AI analysis.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">Challenge Title</th>
                  <th className="p-4">Category & District</th>
                  <th className="p-4">Urgency</th>
                  <th className="p-4">Current Status</th>
                  <th className="p-4">Project Solution Phase</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {challenges.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-slate-900 max-w-xs truncate">{c.title}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[200px]">{c.location}</span>
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-800 block">{c.category}</span>
                      <span className="text-[11px] text-slate-500">{c.district}</span>
                    </td>
                    <td className="p-4">
                      <PriorityBadge priority={c.priority || c.urgency} />
                    </td>
                    <td className="p-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="p-4">
                      {c.project ? (
                        <div className="space-y-1">
                          <span className="font-semibold text-slate-800 capitalize text-xs block">
                            {c.project.currentPhase?.toLowerCase() || 'In Development'}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {c.project.title}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Awaiting university adoption</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/challenges/${c._id}`}
                        className="inline-flex items-center text-xs font-semibold text-gov-800 hover:text-gov-900 bg-white border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded transition-colors shadow-xs"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { Search, MapPin, Users, Filter, RotateCcw, AlertCircle, ExternalLink, ArrowRight } from 'lucide-react';
import { JHARKHAND_DISTRICTS } from '../../constants/districts';

const DISTRICTS = ['All', ...JHARKHAND_DISTRICTS];
const CATEGORIES = [
  'All',
  'Education',
  'Healthcare',
  'Agriculture',
  'Water & sanitation',
  'Environment',
  'Energy',
  'Rural livelihoods',
  'Accessibility',
  'Urban infrastructure',
  'Public services',
];
const STATUSES = ['All', 'VERIFIED', 'IN_PROGRESS', 'SOLUTION_SUBMITTED', 'PILOTING', 'IMPLEMENTED', 'RESOLVED', 'SUBMITTED'];

const DEFAULT_CATEGORY_IMAGES = {
  'Water & sanitation': 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=600&q=80',
  'Environment': 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=600&q=80',
  'Energy': 'https://images.unsplash.com/photo-1508873696983-2df5293cb39f?auto=format&fit=crop&w=600&q=80',
  'Agriculture': 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
  'Healthcare': 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
  'Education': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
  'Urban infrastructure': 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
};

export const ExploreChallenges = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [district, setDistrict] = useState(searchParams.get('district') || 'All');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (district && district !== 'All') query.append('district', district);
      if (category && category !== 'All') query.append('category', category);
      if (status && status !== 'All') query.append('status', status);

      const res = await api.get(`/challenges?${query.toString()}`);
      if (res.success) {
        setChallenges(res.challenges || []);
        setPagination(res.pagination || { total: 0, page: 1, pages: 1 });
      }
    } catch (err) {
      console.error('Error fetching challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [district, category, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchChallenges();
  };

  const handleReset = () => {
    setSearch('');
    setDistrict('All');
    setCategory('All');
    setStatus('All');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Explore Societal Challenges</h1>
        <p className="text-xs text-slate-600 mt-1">
          Crowdsourced grassroot problems across Jharkhand available for university teams and industry partners.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by problem keyword, location, or village..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-700 focus:border-gov-700"
            />
          </div>
          <button
            type="submit"
            className="bg-gov-900 hover:bg-gov-800 text-white text-xs font-semibold px-5 py-2 rounded transition-colors shadow-xs cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full py-2 px-2.5 border border-slate-300 rounded text-xs focus:ring-gov-700"
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Domain / Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full py-2 px-2.5 border border-slate-300 rounded text-xs focus:ring-gov-700"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Lifecycle Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full py-2 px-2.5 border border-slate-300 rounded text-xs focus:ring-gov-700"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleReset}
              className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <p>Showing <span className="font-semibold text-slate-800">{challenges.length}</span> challenges</p>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="text-center py-16 text-xs text-slate-500">Loading challenges from database...</div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">No challenges matched your filters</h3>
          <p className="text-xs text-slate-500">Try changing district or category selections.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {challenges.map((c) => {
            const imageUrl =
              c.media?.[0]?.url ||
              DEFAULT_CATEGORY_IMAGES[c.category] ||
              DEFAULT_CATEGORY_IMAGES['Water & sanitation'];

            return (
              <div
                key={c._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 overflow-hidden flex flex-col justify-between transition-all duration-200"
              >
                {/* Thumbnail Header */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={c.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/95 backdrop-blur-xs text-gov-900 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-slate-200/60 shadow-xs">
                      {c.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <PriorityBadge priority={c.priority || c.urgency} />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                      {c.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mt-1.5">
                      {c.description}
                    </p>

                    <div className="pt-2 text-xs text-slate-500 space-y-1">
                      <p className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{c.location || `${c.district}, Jharkhand`}</span>
                      </p>
                      {c.affectedPeople && (
                        <p className="flex items-center gap-1.5 text-slate-600">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">Affects {c.affectedPeople}</span>
                        </p>
                      )}
                      {c.assignedUniversity && (
                        <p className="text-[11px] text-gov-800 font-medium pt-1 truncate">
                          Adopted by: {c.assignedUniversity.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="px-4 py-2.5 bg-slate-50 -mx-4 -mb-4 border-t border-slate-100 flex items-center justify-between">
                    <StatusBadge status={c.status} />
                    <Link
                      to={`/challenges/${c._id}`}
                      className="text-xs font-semibold text-gov-800 hover:text-gov-900 flex items-center gap-1 group"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

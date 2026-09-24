import React, { useState, useEffect } from 'react';
import { api } from '../../api/apiClient';
import { LeafletMap } from '../../components/LeafletMap';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { Link } from 'react-router-dom';
import { MapPin, Filter, Layers, ExternalLink, ArrowRight } from 'lucide-react';
import { JHARKHAND_DISTRICTS, DISTRICT_MAP_CENTERS } from '../../constants/districts';

export const PublicMap = () => {
  const [challenges, setChallenges] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await api.get('/challenges?limit=50');
        if (res.success) {
          setChallenges(res.challenges || []);
        }
      } catch (err) {
        console.error('Map fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  const filteredChallenges =
    selectedDistrict === 'All'
      ? challenges
      : challenges.filter((c) => c.district === selectedDistrict);

  const currentView = DISTRICT_MAP_CENTERS[selectedDistrict] || DISTRICT_MAP_CENTERS.All;

  // Key quick-pick districts for one-click access
  const QUICK_DISTRICTS = ['All', 'Ranchi', 'Dhanbad', 'Jamshedpur', 'Bokaro', 'Hazaribagh', 'Deoghar', 'Dumka'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Header & District Quick Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Jharkhand Geospatial Problem Map</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive OpenStreetMap coverage across all 24 districts of Jharkhand.
          </p>
        </div>

        {/* All 24 Districts Dropdown + Quick Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-1.5 rounded text-xs font-semibold bg-white border border-slate-300 text-slate-800 focus:ring-1 focus:ring-gov-800 shadow-xs cursor-pointer"
          >
            <option value="All">All 24 Districts (State View)</option>
            {JHARKHAND_DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <div className="hidden sm:flex flex-wrap items-center gap-1">
            {QUICK_DISTRICTS.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDistrict(d)}
                className={`px-2.5 py-1.5 rounded text-[11px] font-semibold transition-colors shadow-xs cursor-pointer ${
                  selectedDistrict === d
                    ? 'bg-gov-900 text-white font-bold'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map + Sidebar List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map (8 cols) */}
        <div className="lg:col-span-8 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm">
          <LeafletMap
            challenges={filteredChallenges}
            center={currentView.center}
            zoom={currentView.zoom}
            height="560px"
          />
        </div>

        {/* Sidebar list of challenges in this view (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col h-[584px] overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-800">
              {selectedDistrict} Problems ({filteredChallenges.length})
            </h3>
            <span className="text-[11px] font-medium text-slate-500">Live Geotags</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
            {filteredChallenges.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-700">No geotagged issues reported yet</p>
                <p className="text-[11px]">Report an issue to pin it on the district map.</p>
              </div>
            ) : (
              filteredChallenges.map((c) => (
                <div key={c._id} className="p-3 rounded-xl hover:bg-slate-50/70 transition-colors space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-gov-800 uppercase tracking-wider">{c.category}</span>
                    <PriorityBadge priority={c.priority || c.urgency} />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 line-clamp-1 leading-tight">
                    {c.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{c.location}</span>
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <StatusBadge status={c.status} />
                    <Link
                      to={`/challenges/${c._id}`}
                      className="text-[11px] font-semibold text-gov-800 hover:text-gov-900 flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

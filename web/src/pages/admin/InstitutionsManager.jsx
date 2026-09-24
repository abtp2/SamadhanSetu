import React, { useState, useEffect } from 'react';
import { api } from '../../api/apiClient';
import { Modal } from '../../components/Modal';
import { Building2, GraduationCap, Plus, Mail, MapPin, Users } from 'lucide-react';
import { JHARKHAND_DISTRICTS } from '../../constants/districts';

export const InstitutionsManager = () => {
  const [universities, setUniversities] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [uniModalOpen, setUniModalOpen] = useState(false);
  const [orgModalOpen, setOrgModalOpen] = useState(false);

  const [uniName, setUniName] = useState('');
  const [uniDistrict, setUniDistrict] = useState('Ranchi');
  const [uniEmail, setUniEmail] = useState('');
  const [uniDomains, setUniDomains] = useState('');

  const [orgName, setOrgName] = useState('');
  const [orgSector, setOrgSector] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgBudget, setOrgBudget] = useState(1000000);

  const fetchData = async () => {
    try {
      const [uRes, oRes] = await Promise.all([
        api.get('/admin/universities'),
        api.get('/admin/organizations'),
      ]);
      if (uRes.success) setUniversities(uRes.universities || []);
      if (oRes.success) setOrganizations(oRes.organizations || []);
    } catch (err) {
      console.error('Fetch institutions error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUni = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/universities', {
        name: uniName,
        district: uniDistrict,
        contactEmail: uniEmail,
        domains: uniDomains.split(',').map((d) => d.trim()).filter(Boolean),
      });
      if (res.success) {
        setUniModalOpen(false);
        setUniName('');
        setUniEmail('');
        setUniDomains('');
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to create university');
    }
  };

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/organizations', {
        name: orgName,
        industrySector: orgSector || 'Manufacturing & Technology',
        contactEmail: orgEmail,
        fundingBudgetAvailable: Number(orgBudget),
      });
      if (res.success) {
        setOrgModalOpen(false);
        setOrgName('');
        setOrgSector('');
        setOrgEmail('');
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to create organization');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-gov-800 uppercase tracking-wider">
              State Nodal Administration
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-semibold">Institutional Directory</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">University & Industry Consortium</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            State-accredited academic institutions and corporate CSR foundations active in Jharkhand.
          </p>
        </div>
      </div>

      {/* Universities Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-4.5 h-4.5 text-gov-800" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Accredited Universities ({universities.length})
            </h2>
          </div>
          <button
            onClick={() => setUniModalOpen(true)}
            className="bg-gov-900 hover:bg-gov-800 text-white font-semibold px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add University</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {universities.map((u) => (
            <div key={u._id} className="p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-3 text-xs">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">{u.name}</h3>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{u.district}, Jharkhand</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-mono bg-blue-50 text-gov-800 border border-blue-200/60 px-1.5 py-0.5 rounded font-semibold shrink-0">
                    {u.code || 'UNIV'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {u.domains?.map((d, i) => (
                    <span key={i} className="text-[10px] bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Faculty: <strong className="text-slate-700">{u.facultyCount}</strong></span>
                <span>Active Projects: <strong className="text-gov-800">{u.activeProjectsCount || 0}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Industry / CSR Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4.5 h-4.5 text-gov-800" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Corporate CSR & Industry Partners ({organizations.length})
            </h2>
          </div>
          <button
            onClick={() => setOrgModalOpen(true)}
            className="bg-gov-900 hover:bg-gov-800 text-white font-semibold px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Industry Partner</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {organizations.map((org) => (
            <div key={org._id} className="p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-3 text-xs">
              <div className="space-y-1.5">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-snug">{org.name}</h3>
                  <p className="text-[11px] text-gov-800 font-semibold mt-0.5">{org.industrySector}</p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{org.description}</p>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Committed Budget:</span>
                <span className="font-bold text-emerald-700">₹{(org.fundingBudgetAvailable || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal 1: Add Uni */}
      <Modal isOpen={uniModalOpen} onClose={() => setUniModalOpen(false)} title="Add University Institution">
        <form onSubmit={handleCreateUni} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">University Full Name</label>
            <input
              type="text"
              required
              value={uniName}
              onChange={(e) => setUniName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">District</label>
              <select
                value={uniDistrict}
                onChange={(e) => setUniDistrict(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs"
              >
                {JHARKHAND_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Nodal Email</label>
              <input
                type="email"
                required
                value={uniEmail}
                onChange={(e) => setUniEmail(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Key Research Domains (comma-separated)</label>
            <input
              type="text"
              value={uniDomains}
              onChange={(e) => setUniDomains(e.target.value)}
              placeholder="Civil & Water, Renewable Energy, Computer Science"
              className="w-full p-2 border border-slate-300 rounded text-xs"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
            <button type="button" onClick={() => setUniModalOpen(false)} className="px-3 py-1.5 border border-slate-300 rounded text-slate-700">
              Cancel
            </button>
            <button type="submit" className="px-4 py-1.5 bg-gov-900 text-white rounded font-semibold">
              Save University
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Add Org */}
      <Modal isOpen={orgModalOpen} onClose={() => setOrgModalOpen(false)} title="Add Industry / CSR Partner">
        <form onSubmit={handleCreateOrg} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company / Foundation Name</label>
            <input
              type="text"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Industry Sector</label>
              <input
                type="text"
                required
                value={orgSector}
                onChange={(e) => setOrgSector(e.target.value)}
                placeholder="Mining, Steel, Agriculture, Energy..."
                className="w-full p-2 border border-slate-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">CSR Budget Pool (INR)</label>
              <input
                type="number"
                value={orgBudget}
                onChange={(e) => setOrgBudget(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">CSR Contact Email</label>
            <input
              type="email"
              required
              value={orgEmail}
              onChange={(e) => setOrgEmail(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-xs"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
            <button type="button" onClick={() => setOrgModalOpen(false)} className="px-3 py-1.5 border border-slate-300 rounded text-slate-700">
              Cancel
            </button>
            <button type="submit" className="px-4 py-1.5 bg-emerald-700 text-white rounded font-semibold">
              Save Partner
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

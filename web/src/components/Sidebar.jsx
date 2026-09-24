import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FilePlus2,
  ListOrdered,
  GraduationCap,
  FolderGit2,
  Users2,
  Building2,
  Handshake,
  BarChart3,
  MapPin,
  FileCheck
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const getLinks = () => {
    switch (role) {
      case 'citizen':
        return [
          { to: '/citizen/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/citizen/report', label: 'Report Challenge', icon: FilePlus2 },
          { to: '/citizen/my-challenges', label: 'My Submissions', icon: ListOrdered },
          { to: '/map', label: 'District Map', icon: MapPin },
        ];
      case 'student':
      case 'university':
        return [
          { to: '/university/dashboard', label: 'Open Challenges', icon: GraduationCap },
          { to: '/university/projects', label: 'Adopted Projects', icon: FolderGit2 },
          { to: '/explore', label: 'All State Challenges', icon: ListOrdered },
          { to: '/map', label: 'Geospatial Map', icon: MapPin },
        ];
      case 'industry':
        return [
          { to: '/industry/dashboard', label: 'Project Discovery', icon: Building2 },
          { to: '/industry/partnerships', label: 'Active Partnerships', icon: Handshake },
          { to: '/analytics', label: 'State Impact', icon: BarChart3 },
          { to: '/map', label: 'District Map', icon: MapPin },
        ];
      case 'admin':
        return [
          { to: '/admin/dashboard', label: 'Command Center', icon: LayoutDashboard },
          { to: '/admin/verification', label: 'Verification Queue', icon: FileCheck },
          { to: '/admin/institutions', label: 'Institutions & Industry', icon: Users2 },
          { to: '/analytics', label: 'Impact Analytics', icon: BarChart3 },
          { to: '/map', label: 'Operations Map', icon: MapPin },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-white text-slate-700 border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* User Header Snippet */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded bg-gov-900 text-white font-bold flex items-center justify-center text-sm shadow-xs">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-900 truncate">{user.name}</h4>
            <p className="text-[11px] text-slate-500 capitalize font-medium">
              {role}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {user.universityName || user.organizationName || user.district || 'Jharkhand'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 py-4 px-3 space-y-1">
        <p className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Navigation
        </p>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded text-xs transition-colors font-medium ${
                  isActive
                    ? 'bg-gov-50 text-gov-900 font-bold border-l-4 border-gov-900 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 opacity-75 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500">
        <div className="flex items-center justify-between">
          <span>State Nodal Office</span>
          <span className="text-slate-400 text-[10px]">Jharkhand</span>
        </div>
      </div>
    </aside>
  );
};

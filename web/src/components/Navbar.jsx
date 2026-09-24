import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/apiClient';
import {
  Layers,
  MapPin,
  BarChart3,
  Bell,
  LogOut,
  User,
  PlusCircle,
  Menu,
  X,
  CheckCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  GraduationCap,
  Building2,
  Trash2,
} from 'lucide-react';

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'SUCCESS':
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    case 'WARNING':
      return <AlertCircle className="w-4 h-4 text-amber-600" />;
    case 'CHALLENGE':
      return <FileText className="w-4 h-4 text-blue-600" />;
    case 'PROJECT':
      return <GraduationCap className="w-4 h-4 text-purple-600" />;
    case 'COLLABORATION':
      return <Building2 className="w-4 h-4 text-indigo-600" />;
    default:
      return <Bell className="w-4 h-4 text-gov-800" />;
  }
};

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  const dropdownRef = useRef(null);
  const bellBtnRef = useRef(null);
  const mobileBellBtnRef = useRef(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications');
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [isAuthenticated]);

  useEffect(() => {
    if (notifOpen) {
      fetchNotifications();
    }
  }, [notifOpen]);

  // Click outside and Esc key listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !bellBtnRef.current?.contains(event.target) &&
        !mobileBellBtnRef.current?.contains(event.target)
      ) {
        setNotifOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setNotifOpen(false);
      }
    };

    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [notifOpen]);

  const handleNotificationClick = async (n) => {
    if (!n.read) {
      try {
        await api.patch(`/notifications/${n._id}/read`);
        setNotifications((prev) =>
          prev.map((item) => (item._id === n._id ? { ...item, read: true } : item))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        // ignore
      }
    }
    setNotifOpen(false);
    if (n.link) {
      navigate(n.link);
    }
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => {
        const target = prev.find((n) => n._id === id);
        if (target && !target.read) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n._id !== id);
      });
    } catch (err) {
      // ignore
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      // ignore
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'citizen': return '/citizen/dashboard';
      case 'student':
      case 'university': return '/university/dashboard';
      case 'industry': return '/industry/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/';
    }
  };

  return (
    <header className="bg-gov-900 text-white sticky top-0 z-40 border-b border-gov-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-white text-gov-900 font-bold flex items-center justify-center text-sm">
              स
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block leading-tight">
                SamadhanSetu
              </span>
              <p className="text-[11px] text-slate-300 tracking-wide font-normal">
                Govt. of Jharkhand
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/explore"
              className="px-3 py-1.5 rounded text-xs font-medium text-slate-200 hover:text-white hover:bg-gov-800 transition-colors flex items-center space-x-1.5"
            >
              <Layers className="w-3.5 h-3.5 opacity-80" />
              <span>Browse Issues</span>
            </Link>

            <Link
              to="/map"
              className="px-3 py-1.5 rounded text-xs font-medium text-slate-200 hover:text-white hover:bg-gov-800 transition-colors flex items-center space-x-1.5"
            >
              <MapPin className="w-3.5 h-3.5 opacity-80" />
              <span>District Map</span>
            </Link>

            <Link
              to="/analytics"
              className="px-3 py-1.5 rounded text-xs font-medium text-slate-200 hover:text-white hover:bg-gov-800 transition-colors flex items-center space-x-1.5"
            >
              <BarChart3 className="w-3.5 h-3.5 opacity-80" />
              <span>Impact Analytics</span>
            </Link>
          </nav>

          {/* User & Action CTAs */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Citizen Report Button */}
                <Link
                  to="/citizen/report"
                  className="inline-flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-3 py-1.5 rounded text-xs transition-colors shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Report Issue</span>
                </Link>

                {/* Notifications Bell */}
                <button
                  ref={bellBtnRef}
                  onClick={() => setNotifOpen((prev) => !prev)}
                  className={`p-2 rounded text-slate-200 hover:text-white hover:bg-gov-800 relative transition-colors ${
                    notifOpen ? 'bg-gov-800 text-white' : ''
                  }`}
                  title="Notifications"
                  aria-label="View notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dashboard button */}
                <Link
                  to={getDashboardPath()}
                  className="inline-flex items-center space-x-1.5 bg-gov-800 hover:bg-gov-700 text-white px-3 py-1.5 rounded text-xs font-medium border border-gov-700 transition-colors"
                >
                  <User className="w-3.5 h-3.5 opacity-80" />
                  <span className="capitalize">{user.role} Dashboard</span>
                </Link>

                {/* Logout */}
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="p-1.5 text-slate-300 hover:text-rose-400 hover:bg-gov-800 rounded transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-medium text-slate-200 hover:text-white px-3 py-1.5 rounded hover:bg-gov-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gov-700 hover:bg-gov-600 text-white text-xs font-semibold px-3 py-1.5 rounded border border-gov-600 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger & actions */}
          <div className="md:hidden flex items-center space-x-1">
            {isAuthenticated && (
              <button
                ref={mobileBellBtnRef}
                onClick={() => {
                  setNotifOpen((prev) => !prev);
                  if (mobileMenuOpen) setMobileMenuOpen(false);
                }}
                className={`p-2 rounded text-slate-200 hover:text-white hover:bg-gov-800 relative transition-colors ${
                  notifOpen ? 'bg-gov-800 text-white' : ''
                }`}
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                if (notifOpen) setNotifOpen(false);
              }}
              className="p-2 text-slate-200 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Improved Notification Dropdown */}
        {notifOpen && (
          <div
            ref={dropdownRef}
            className="absolute right-4 sm:right-6 lg:right-8 top-16 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white rounded-2xl border border-slate-200/90 shadow-2xl z-50 text-slate-800 overflow-hidden animate-in fade-in duration-150"
          >
            {/* Dropdown Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-gov-800" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-semibold text-gov-800 hover:text-gov-900 hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Notification Items List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="py-10 px-6 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Bell className="w-5 h-5 opacity-60" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">No notifications yet</p>
                  <p className="text-[11px] text-slate-400">
                    When your reports, project milestones, or partnerships update, they'll show up here.
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => handleNotificationClick(n)}
                    className={`group p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 relative ${
                      !n.read ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      {getNotificationIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-xs leading-snug line-clamp-1 ${
                            !n.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                          }`}
                        >
                          {n.title}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {formatTimeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>

                    {/* Unread indicator dot */}
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />
                    )}

                    {/* Dismiss Button */}
                    <button
                      onClick={(e) => handleDeleteNotification(e, n._id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-rose-500 rounded absolute right-2 bottom-2"
                      title="Dismiss notification"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Dropdown Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  {notifications.length} notification{notifications.length === 1 ? '' : 's'}
                </span>
                {unreadCount === 0 ? (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> All caught up
                  </span>
                ) : (
                  <button
                    onClick={markAllRead}
                    className="text-gov-800 font-semibold hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gov-800 bg-gov-900 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-sm text-slate-200 hover:bg-gov-800"
          >
            Browse Issues
          </Link>
          <Link
            to="/map"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-sm text-slate-200 hover:bg-gov-800"
          >
            District Map
          </Link>
          <Link
            to="/analytics"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-sm text-slate-200 hover:bg-gov-800"
          >
            Impact Analytics
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded text-sm bg-gov-800 text-white font-medium"
              >
                Go to {user?.role} Dashboard
              </Link>
              <Link
                to="/citizen/report"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded text-sm bg-amber-500 text-slate-950 font-semibold"
              >
                Report a Challenge
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate('/');
                }}
                className="w-full text-left px-3 py-2 rounded text-sm text-rose-400 hover:bg-gov-800"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm text-slate-200 border border-gov-800 rounded"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm bg-gov-700 text-white rounded font-medium"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { StatusBadge } from '../../components/StatusBadge';
import {
  FileText,
  GraduationCap,
  CheckCircle2,
  MapPin,
  ArrowRight,
  Building2,
  Users,
  Award,
  ChevronRight,
  ChevronLeft,
  PlusCircle,
  Layers,
  Droplets,
  Zap,
  Sprout,
  Activity,
  Wrench,
  BookOpen,
} from 'lucide-react';

const DEFAULT_CATEGORY_IMAGES = {
  'Water & sanitation': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  'Environment': 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=800&q=80',
  'Energy': 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=800&q=80',
  'Agriculture': 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
  'Healthcare': 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
  'Education': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
  'Urban infrastructure': 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
};

const HERO_SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80',
    title: 'Water Filtration & Testing',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1000&q=80',
    title: 'Solar & Renewable Energy',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80',
    title: 'University Engineering Labs',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1000&q=80',
    title: 'Smart Civic Infrastructure',
  },
];

const JHARKHAND_HERO_BG = [
  {
    id: 1,
    title: 'Saranda & Betla Forests',
    subtitle: 'Sal & Teak canopies of the Chota Nagpur Plateau',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=80',
  },
  {
    id: 2,
    title: 'Baba Baidyanath Dham, Deoghar',
    subtitle: 'Sacred Jyotirlinga architectural heritage',
    image: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Baidyanathdham.jpg',
  },
  {
    id: 3,
    title: 'Hundru Falls, Ranchi',
    subtitle: 'Subarnarekha river cascading over Chota Nagpur falls',
    image: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Hundru_Falls%2C_Jharkhand%2C_India_4.jpg',
  },
  {
    id: 4,
    title: 'Patratu Valley & Netarhat',
    subtitle: 'Misty hairpin ghats and lush panoramic hills',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80',
  },
  {
    id: 5,
    title: 'Historic Jagannath Temple, Ranchi',
    subtitle: '17th-century fortress shrine on Barkagarh hill',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/1_Jagganath_temple_Ranchi_Jharkhand.jpg',
  },
];


const IMPACT_SECTORS = [
  {
    name: 'Water & sanitation',
    title: 'Water & Sanitation',
    icon: Droplets,
    description: 'Borewell filtration, drinking water testing, and village drainage.',
    link: '/explore?category=Water%20%26%20sanitation',
  },
  {
    name: 'Energy',
    title: 'Renewable Energy',
    icon: Zap,
    description: 'Solar microgrids, school power systems, and agricultural solar pumps.',
    link: '/explore?category=Energy',
  },
  {
    name: 'Agriculture',
    title: 'Agrarian Systems',
    icon: Sprout,
    description: 'Solar cold storage, soil sensors, and micro-irrigation solutions.',
    link: '/explore?category=Agriculture',
  },
  {
    name: 'Healthcare',
    title: 'Public Health',
    icon: Activity,
    description: 'Clinic diagnostic tools, vaccine cold-chains, and telemedicine.',
    link: '/explore?category=Healthcare',
  },
  {
    name: 'Urban infrastructure',
    title: 'Urban Infrastructure',
    icon: Wrench,
    description: 'Pothole detection, road maintenance, and municipal drainage.',
    link: '/explore?category=Urban%20infrastructure',
  },
  {
    name: 'Education',
    title: 'Education Tech',
    icon: BookOpen,
    description: 'Solar classrooms, digital literacy tools, and STEM kits.',
    link: '/explore?category=Education',
  },
];

const PARTNERS = [
  { name: 'BIT Mesra', district: 'Ranchi' },
  { name: 'IIT (ISM) Dhanbad', district: 'Dhanbad' },
  { name: 'NIT Jamshedpur', district: 'Jamshedpur' },
  { name: 'Ranchi University', district: 'Ranchi' },
  { name: 'Tata Steel CSR', district: 'Jamshedpur' },
  { name: 'CCL Jharkhand', district: 'Ranchi' },
];

const getTimeAgo = (dateString) => {
  if (!dateString) return '2 days ago';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '2 days ago';
    const now = new Date();
    const diffMs = Math.max(0, now - date);
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks === 1) return '1 week ago';
    if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  } catch (e) {
    return '2 days ago';
  }
};

export const LandingPage = () => {
  const [stats, setStats] = useState(null);
  const [recentChallenges, setRecentChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [bgSlide, setBgSlide] = useState(0);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const [statsRes, challengesRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/challenges?limit=6&status=VERIFIED'),
        ]);

        if (statsRes.success) setStats(statsRes.metrics);
        if (challengesRes.success && challengesRes.challenges) {
          setRecentChallenges(challengesRes.challenges);
        } else {
          setRecentChallenges([]);
        }
      } catch (err) {
        console.error('Error fetching landing data:', err);
        setRecentChallenges([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  // Simple auto-rotation for right slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Smooth cross-fade auto-rotation for Jharkhand background images
  useEffect(() => {
    const bgTimer = setInterval(() => {
      setBgSlide((prev) => (prev + 1) % JHARKHAND_HERO_BG.length);
    }, 6000);
    return () => clearInterval(bgTimer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const displayChallenges = recentChallenges;

  const impactMetrics = [
    {
      key: 'reported',
      tag: 'REPORTED',
      value: stats?.totalChallenges ?? 0,
      sub: 'Grassroots problems',
      icon: FileText,
    },
    {
      key: 'verified',
      tag: 'VERIFIED',
      value: stats?.verifiedChallenges ?? 0,
      sub: 'By local authorities',
      icon: CheckCircle2,
    },
    {
      key: 'in_progress',
      tag: 'IN PROGRESS',
      value: stats?.activeProjects ?? 0,
      sub: 'University taskforces',
      icon: GraduationCap,
    },
    {
      key: 'resolved',
      tag: 'RESOLVED',
      value: stats?.resolvedChallenges ?? 0,
      sub: 'Piloted on ground',
      icon: Award,
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-16 bg-slate-50 min-h-screen">
      {/* HERO SECTION: Fading Jharkhand background (forests, temples, waterfalls, hills) */}
      <section className="relative overflow-hidden py-14 sm:py-20 border-b border-gov-950 bg-slate-950">
        {/* Fading Background Slideshow */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {JHARKHAND_HERO_BG.map((item, idx) => (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === bgSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={item.image}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-6000 ease-out"
              />
            </div>
          ))}

          {/* Dual Overlay Gradients to ensure text readability while preserving Jharkhand imagery */}
          <div className="absolute inset-0 bg-gradient-to-r from-gov-950/95 via-gov-950/85 to-gov-950/75 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-gov-950/95 via-transparent to-black/50 z-10" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Content with adapted high-contrast text */}
            <div className="lg:col-span-7 space-y-5">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-snug sm:leading-snug lg:leading-[1.22] drop-shadow-xs">
                Solving Local Challenges Through Civic Collaboration
              </h1>

              <p className="text-sm sm:text-base text-slate-200 max-w-xl leading-loose font-normal drop-shadow-xs">
                Report community issues across Jharkhand. Universities engineer practical prototypes, supported by CSR grants and state administration.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 mt-10 sm:mt-12 pt-2">
                <Link
                  to="/explore"
                  className="bg-gov-800/90 hover:bg-gov-800 text-white font-medium px-5 py-2.5 rounded text-xs sm:text-sm border border-white/20 hover:border-white/40 transition-colors inline-flex items-center justify-center space-x-2 backdrop-blur-xs shadow-xs"
                >
                  <Layers className="w-4 h-4 text-slate-300" />
                  <span>Browse Issues</span>
                </Link>
                <Link
                  to="/map"
                  className="bg-white/15 hover:bg-white/25 text-white font-medium px-4 py-2.5 rounded text-xs sm:text-sm border border-white/25 hover:border-white/50 transition-colors inline-flex items-center justify-center space-x-2 backdrop-blur-xs shadow-xs"
                >
                  <MapPin className="w-4 h-4 text-slate-300" />
                  <span>District Map</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Simplest Image Slider (Natural aspect ratio, no manual height) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-slate-950/80 aspect-[4/3] sm:aspect-[16/10] w-full shadow-2xl backdrop-blur-xs">
                {HERO_SLIDES.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                      index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}

                {/* Minimal Bottom Bar */}
                <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 px-4 py-3 text-white flex items-center justify-between text-xs z-20 border-t border-white/10 backdrop-blur-xs">
                  <span className="font-medium truncate">{HERO_SLIDES[currentSlide].title}</span>
                  <div className="flex items-center space-x-2 shrink-0 ml-3">
                    <button
                      type="button"
                      onClick={prevSlide}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
                      title="Previous"
                      aria-label="Previous"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {currentSlide + 1}/{HERO_SLIDES.length}
                    </span>
                    <button
                      type="button"
                      onClick={nextSlide}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
                      title="Next"
                      aria-label="Next"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* STATE IMPACT METRICS: 1 Heading + 1 Subheading */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              State Impact Metrics
            </h2>
            <p className="text-xs text-slate-500">
              Current progress across Jharkhand
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs font-semibold text-gov-800 hover:text-gov-900 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {impactMetrics.map((m) => (
            <div
              key={m.key}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 flex flex-col justify-between transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-gov-900 flex items-center justify-center">
                  <m.icon className="w-4.5 h-4.5 text-gov-900" />
                </div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {m.tag}
                </span>
              </div>

              <div className="mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-gov-900 tracking-tight">
                  {m.value}
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-2 truncate">
                {m.sub}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CORE FOCUS AREAS: 1 Heading + 1 Subheading */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Priority Focus Areas
            </h2>
            <p className="text-xs text-slate-500">
              Key problem categories for university and CSR adoption
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs font-semibold text-gov-800 hover:text-gov-900 flex items-center gap-1 shrink-0"
          >
            <span>Browse All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {IMPACT_SECTORS.map((sector) => {
            const Icon = sector.icon;
            return (
              <div
                key={sector.name}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 flex flex-col justify-between transition-all duration-200"
              >
                <div className="space-y-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-gov-900 flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-gov-900" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      {sector.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {sector.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-100">
                  <Link
                    to={sector.link}
                    className="text-xs font-semibold text-gov-800 hover:text-gov-900 flex items-center gap-1 group"
                  >
                    <span>Browse Issues</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* RECENT VERIFIED ISSUES: 1 Heading + 1 Subheading */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Recent Verified Issues
            </h2>
            <p className="text-xs text-slate-500">
              Problems vetted by authorities awaiting solutions
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs font-semibold text-gov-800 hover:text-gov-900 flex items-center gap-1"
          >
            <span>See All ({stats?.totalChallenges ?? 0})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-slate-500">Loading verified issues...</div>
        ) : displayChallenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {displayChallenges.slice(0, 3).map((c) => {
              const imageUrl =
                c.media?.[0]?.url ||
                DEFAULT_CATEGORY_IMAGES[c.category] ||
                DEFAULT_CATEGORY_IMAGES['Water & sanitation'];

              const timeAgo = getTimeAgo(c.createdAt);

              return (
                <div
                  key={c._id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 overflow-hidden flex flex-col justify-between transition-all duration-200"
                >
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={c.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white text-gov-900 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-slate-200 shadow-xs">
                        {c.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={c.status} />
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">
                        {c.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{c.location || `${c.district}, Jharkhand`}</span>
                      </div>
                      {c.affectedPeople && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">Impacts {c.affectedPeople}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>{timeAgo}</span>
                      <Link
                        to={`/challenges/${c._id}`}
                        className="font-semibold text-gov-800 hover:text-gov-900 flex items-center gap-1 group"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-xs text-slate-500 space-y-2">
            <p className="font-semibold text-slate-800">No verified issues listed yet.</p>
            <p>Be the first citizen or authority to report a neighborhood challenge.</p>
            <div className="pt-2">
              <Link
                to="/citizen/report"
                className="inline-block bg-gov-800 hover:bg-gov-900 text-white font-medium px-4 py-2 rounded text-xs transition-colors"
              >
                Report an Issue
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* HOW IT WORKS: 1 Heading + 1 Subheading */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            How SamadhanSetu Works
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            From citizen report to field implementation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 space-y-2 transition-all duration-200">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-gov-900 flex items-center justify-center font-bold text-sm">
              <FileText className="w-4.5 h-4.5 text-gov-900" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">1. Report Issues</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Citizens geotag local problems with photos, urgency, and affected count.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 space-y-2 transition-all duration-200">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-gov-900 flex items-center justify-center font-bold text-sm">
              <GraduationCap className="w-4.5 h-4.5 text-gov-900" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">2. Engineer Solutions</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              University student and faculty teams build working hardware and software prototypes.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 space-y-2 transition-all duration-200">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-gov-900 flex items-center justify-center font-bold text-sm">
              <CheckCircle2 className="w-4.5 h-4.5 text-gov-900" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">3. Field Deployment</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Corporate CSR programs fund deployment, and authorities certify field resolution.
            </p>
          </div>
        </div>
      </section>

      {/* HOW TO PARTICIPATE: 1 Heading + 1 Subheading */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            How to Get Involved
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Action pathways for citizens, universities, and CSR partners
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Citizen */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 flex flex-col justify-between transition-all duration-200">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-gov-900 flex items-center justify-center">
                <Users className="w-4.5 h-4.5 text-gov-900" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">For Citizens</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Report civic problems in your neighborhood and track real-time resolution status.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-2">
              <Link
                to="/citizen/report"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 px-3 rounded text-xs text-center block transition-colors shadow-xs"
              >
                Report an Issue
              </Link>
            </div>
          </div>

          {/* University */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 flex flex-col justify-between transition-all duration-200">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-gov-900 flex items-center justify-center">
                <GraduationCap className="w-4.5 h-4.5 text-gov-900" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">For Universities</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Adopt verified problem statements for capstone projects with CSR prototyping grants.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-2">
              <Link
                to="/explore"
                className="w-full bg-gov-800 hover:bg-gov-700 text-white font-semibold py-2 px-3 rounded text-xs text-center block border border-gov-700 transition-colors"
              >
                Browse Problem Bank
              </Link>
            </div>
          </div>

          {/* CSR */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 flex flex-col justify-between transition-all duration-200">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-gov-900 flex items-center justify-center">
                <Building2 className="w-4.5 h-4.5 text-gov-900" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">For CSR Partners</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Direct CSR funding toward verified grassroots prototypes with transparent outcomes.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-2">
              <Link
                to="/register"
                className="w-full bg-gov-800 hover:bg-gov-700 text-white font-semibold py-2 px-3 rounded text-xs text-center block border border-gov-700 transition-colors"
              >
                Partner with Platform
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PARTNER CONSORTIUM: 1 Heading + 1 Subheading */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 text-center shadow-sm">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-0.5">
            Participating Institutions
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            Academic and CSR partners collaborating across Jharkhand
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {PARTNERS.map((inst) => (
              <div
                key={inst.name}
                className="bg-slate-50/80 rounded-xl border border-slate-200/80 p-3 text-center hover:bg-white hover:shadow-sm hover:border-blue-200 transition-all duration-200"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-gov-900 flex items-center justify-center mx-auto mb-1.5">
                  <Building2 className="w-3.5 h-3.5 text-gov-900" />
                </div>
                <p className="text-xs font-bold text-slate-800 line-clamp-1">{inst.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{inst.district}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

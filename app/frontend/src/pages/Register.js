import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { 
  Users, Mail, Lock, User, Phone, CheckCircle2, XCircle,
  Sparkles, Shield, Zap, Eye, EyeOff, Check, ArrowRight, Star
} from 'lucide-react';

const calculatePasswordStrength = (password) => {
  if (!password) return { strength: 0, label: '', isSecure: false, checks: {} };
  
  const checks = {
    length: password.length >= 6,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
  
  const allCriteriaMet = checks.length && checks.upper && checks.lower && checks.number;
  
  let score = 0;
  if (checks.length) score += 40;
  if (password.length >= 8) score += 20;
  if (checks.upper) score += 15;
  if (checks.lower) score += 15;
  if (checks.number) score += 10;
  
  let label = '';
  let isSecure = allCriteriaMet;
  
  if (!allCriteriaMet) {
    label = 'Weak';
  } else if (password.length >= 8) {
    label = 'Strong';
  } else {
    label = 'Good';
  }
  
  return { strength: score, label, isSecure, checks };
};

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, label: '', isSecure: false, checks: {} });
  const [errorMessage, setErrorMessage] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(formData.password));
  }, [formData.password]);

  useEffect(() => {
    if (errorMessage) {
      setErrorMessage('');
    }
  }, [formData.email, formData.password, formData.name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!agreedToTerms) {
      setErrorMessage('Please accept the Terms and Conditions and Privacy Policy to continue');
      return;
    }
    
    if (!passwordStrength.isSecure) {
      const missing = [];
      if (!passwordStrength.checks.length) missing.push('6+ characters');
      if (!passwordStrength.checks.upper) missing.push('uppercase letter');
      if (!passwordStrength.checks.lower) missing.push('lowercase letter');
      if (!passwordStrength.checks.number) missing.push('number');
      
      if (missing.length > 0) {
        setErrorMessage(`Password must include: ${missing.join(', ')}`);
      } else {
        setErrorMessage('Please enter a valid password');
      }
      return;
    }
    
    setLoading(true);
    try {
      await register(formData);
      toast.success('Account created! Choose your plan to get started.');
      try {
        sessionStorage.setItem('welcomeFromRegistration', JSON.stringify({ name: formData.name || '' }));
      } catch (_) {}
      navigate('/pricing', { replace: true, state: { fromRegistration: true, name: formData.name } });
    } catch (error) {
      console.error('Registration error:', error);
      const errMsg = error.response?.data?.detail ||
                          'Registration failed. Please check your information and try again.';
      setErrorMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding & Benefits */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#3B2ED0] via-[#4F46E5] to-[#6366F1] p-16 flex-col justify-between relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300 rounded-full"></div>
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-3 mb-16 group">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">GuestWorker</h1>
              <p className="text-sm text-white/80">Workforce Management</p>
            </div>
          </Link>

          {/* Main Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-5xl font-bold text-white mb-4 leading-tight">
                Join 100+ Successful Contractors
              </h2>
              <p className="text-xl text-white/90 leading-relaxed">
                Transform your workforce management and save 10+ hours every week. Setup takes just 2 minutes!
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-5">
              {[
                { icon: Shield, text: 'Bank-level security & data encryption', color: 'text-blue-200' },
                { icon: Check, text: 'Free 7-day trial - No credit card required', color: 'text-green-200' },
                { icon: Zap, text: 'Setup in under 2 minutes', color: 'text-yellow-200' },
                { icon: Users, text: 'Trusted by 100+ contractors across India', color: 'text-pink-200' }
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-4 text-white">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                  </div>
                  <span className="text-lg font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 bg-white/10 border border-white/20 rounded-2xl p-6">
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-white/95 text-base mb-4 leading-relaxed italic">
            "GuestWorker transformed how I manage my team. The setup was incredibly simple and support is outstanding!"
          </p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold">Rajesh Kumar</p>
              <p className="text-white/70 text-sm">Construction Contractor, Delhi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white">
        <div className="w-full max-w-xl">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#3B2ED0] to-[#6366F1] rounded-2xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#3B2ED0] to-[#6366F1] bg-clip-text text-transparent">GuestWorker</h1>
                <p className="text-xs text-gray-600">Workforce Management</p>
              </div>
            </Link>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Create your account</h2>
            <p className="text-lg text-gray-600">Start your free 7-day trial today</p>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Secure & Encrypted</span>
            </div>
            <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">7-Day Free Trial</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full">
              <Zap className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">No Credit Card</span>
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage('')}
                  className="text-red-400 hover:text-red-600"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-12 h-14 border-2 border-gray-200 focus:border-[#3B2ED0] rounded-xl text-base"
                  required
                  data-testid="register-name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-12 h-14 border-2 border-gray-200 focus:border-[#3B2ED0] rounded-xl text-base"
                  required
                  data-testid="register-email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-12 pr-12 h-14 border-2 border-gray-200 focus:border-[#3B2ED0] rounded-xl text-base"
                  required
                  data-testid="register-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {formData.password && !passwordStrength.isSecure && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Password requirements:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'length', label: '6+ characters' },
                      { key: 'upper', label: 'Uppercase' },
                      { key: 'lower', label: 'Lowercase' },
                      { key: 'number', label: 'Number' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-2">
                        {passwordStrength.checks[key] ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <span className={`text-xs ${passwordStrength.checks[key] ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {formData.password && passwordStrength.isSecure && (
                <div className="mt-3 flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-semibold">Strong password!</span>
                </div>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Phone Number <span className="text-xs text-gray-500 font-normal">(Optional)</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-12 h-14 border-2 border-gray-200 focus:border-[#3B2ED0] rounded-xl text-base"
                />
              </div>
            </div>

            {/* Terms */}
            <div className="pt-2">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border-2" style={{ borderColor: agreedToTerms ? '#3B2ED0' : '#E5E7EB' }}>
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked)}
                  className="mt-0.5 h-5 w-5 data-[state=checked]:bg-[#3B2ED0] data-[state=checked]:border-[#3B2ED0]"
                />
                <Label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer leading-relaxed">
                  I agree to the{' '}
                  <Link to="/terms-and-conditions" target="_blank" className="text-[#3B2ED0] hover:underline font-semibold" onClick={(e) => e.stopPropagation()}>
                    Terms and Conditions
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy-policy" target="_blank" className="text-[#3B2ED0] hover:underline font-semibold" onClick={(e) => e.stopPropagation()}>
                    Privacy Policy
                  </Link>
                  <span className="text-red-500 ml-1">*</span>
                </Label>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#3B2ED0] to-[#6366F1] hover:from-[#2A1FB8] hover:to-[#4F46E5] text-white shadow-lg h-14 text-lg font-semibold rounded-xl mt-6"
              disabled={loading || !agreedToTerms}
              data-testid="register-submit"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating your account...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <span>Create Free Account</span>
                </div>
              )}
            </Button>
          </form>

          {/* Sign In */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-3">Already have an account?</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-[#3B2ED0] hover:text-[#2A1FB8] font-semibold text-base group"
              data-testid="register-login-link"
            >
              Sign in here
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

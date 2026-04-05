import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { toast } from 'sonner';
import { 
  Users, Mail, Lock, Eye, EyeOff, Shield, Zap, 
  CheckCircle2, ArrowRight, Star, User, Clock
} from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [expirationDialogOpen, setExpirationDialogOpen] = useState(false);
  const [expirationData, setExpirationData] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedInUser = await login(formData.email, formData.password);
      toast.success('Login successful!');
      
      const isExpired = loggedInUser?.subscription_status === 'expired' || 
        (loggedInUser?.plan_end_date && new Date(loggedInUser.plan_end_date) < new Date());
      
      if (isExpired) {
        const endDate = loggedInUser?.plan_end_date ? new Date(loggedInUser.plan_end_date) : null;
        const formattedDate = endDate ? endDate.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }) : 'the expiration date';
        
        const wasTrial = loggedInUser?.payment_method === 'trial';
        
        setExpirationData({
          wasTrial,
          formattedDate,
          endDate
        });
        setExpirationDialogOpen(true);
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      
      const status = error.response?.status;
      const detail = error.response?.data?.detail;
      
      if (status === 429 || (detail && detail.includes('locked'))) {
        toast.error(detail || 'Too many login attempts. Please try again later.');
      } else if (status === 403 && detail && detail.includes('inactive')) {
        toast.error(detail);
      } else {
        toast.error('Login failed. Please check your email and password.');
      }
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
                Welcome Back!
              </h2>
              <p className="text-xl text-white/90 leading-relaxed">
                Access your dashboard and continue managing your workforce with ease. Get back to work in seconds.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-5">
              {[
                { icon: Shield, text: 'Your data is secure and encrypted', color: 'text-blue-200' },
                { icon: Zap, text: 'Instant access to your dashboard', color: 'text-yellow-200' },
                { icon: CheckCircle2, text: 'Quick login, no delays', color: 'text-green-200' }
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

      </div>

      {/* Right Panel - Login Form */}
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
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Welcome back!</h2>
            <p className="text-lg text-gray-600">Sign in to access your dashboard</p>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Secure Login</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
              <Lock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Encrypted</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full">
              <Zap className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Fast Access</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Email Address
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
                  data-testid="login-email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-12 pr-12 h-14 border-2 border-gray-200 focus:border-[#3B2ED0] rounded-xl text-base"
                  required
                  data-testid="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#3B2ED0] to-[#6366F1] hover:from-[#2A1FB8] hover:to-[#4F46E5] text-white shadow-lg h-14 text-lg font-semibold rounded-xl mt-6"
              disabled={loading}
              data-testid="login-submit"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing you in...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  <span>Sign In to Dashboard</span>
                </div>
              )}
            </Button>
          </form>

          {/* Create Account */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-3">Don't have an account?</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-[#3B2ED0] hover:text-[#2A1FB8] font-semibold text-base group"
              data-testid="login-register-link"
            >
              Create a free account
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Expiration Dialog */}
      <Dialog open={expirationDialogOpen} onOpenChange={setExpirationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <DialogTitle className="text-xl">
                {expirationData?.wasTrial ? 'Free Trial Expired' : 'Subscription Expired'}
              </DialogTitle>
            </div>
            <DialogDescription className="text-base pt-2">
              {expirationData?.wasTrial 
                ? `Your free trial expired on ${expirationData.formattedDate}. To continue using all features, please subscribe to a plan.`
                : `Your subscription ended on ${expirationData?.formattedDate}. Please resubscribe to continue using the platform.`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700 mb-3 font-medium">What you can do:</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Choose a subscription plan that fits your needs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Contact support for assistance with activation keys</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Your data will be preserved for 30 days</span>
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setExpirationDialogOpen(false);
                navigate('/contact-us');
              }}
              className="w-full sm:w-auto"
            >
              Contact Support
            </Button>
            <Button
              onClick={() => {
                setExpirationDialogOpen(false);
                navigate('/pricing');
              }}
              className="w-full sm:w-auto bg-[#3B2ED0] hover:bg-[#2A1FB8]"
            >
              {expirationData?.wasTrial ? 'View Plans' : 'Resubscribe'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

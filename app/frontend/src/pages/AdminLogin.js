import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Shield, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';

// Backend API configuration
const BACKEND_HOST = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://api.guestworker.app' 
    : `http://${window.location.hostname}:8000`);
const API = `${BACKEND_HOST}/api`;
axios.defaults.withCredentials = true;

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/admin/login`, formData);
      
      if (response.data) {
        // SECURITY: Never store sensitive data in localStorage (XSS vulnerability)
        // JWT token in httpOnly cookie is sufficient for authentication
        toast.success('Login successful!');
        navigate('/admin/dashboard');
      }
    } catch (error) {
      // Log detailed errors for debugging
      console.error('Login error:', error);
      
      // Show specific messages for rate limiting and account lockout
      // These are security-relevant errors that admins need to know about
      const status = error.response?.status;
      const detail = error.response?.data?.detail;
      
      if (status === 429 || (detail && detail.includes('locked'))) {
        // Show rate limit/lockout messages (security feature, not information leakage)
        toast.error(detail || 'Too many login attempts. Please try again later.', {
          duration: 5000
        });
      } else if (status === 403 && detail && detail.includes('disabled')) {
        // Show account status messages
        toast.error(detail);
      } else {
        // Generic message for all other login failures (prevents enumeration)
        toast.error('Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Card className="w-full max-w-md shadow-2xl border-slate-700">
        <CardHeader className="space-y-3 pb-6">
          <div className="flex justify-center">
            <div className="p-4 bg-purple-600 rounded-2xl shadow-lg">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center text-white">
            Admin Portal
          </CardTitle>
          <p className="text-center text-slate-400 text-sm">
            Secure access to GuestWorker Admin Panel
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter admin email"
                required
                className="h-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                required
                className="h-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              This is a secure admin portal. Unauthorized access is prohibited.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Save, Eye, EyeOff, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import adminApi from '../utils/adminApi';

export default function PaymentGatewaySettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [settings, setSettings] = useState({
    razorpay_key_id: '',
    razorpay_key_secret: ''
  });

  useEffect(() => {
    checkAuth();
    fetchSettings();
  }, []);

  const checkAuth = async () => {
    try {
      await adminApi.getAdminProfile();
    } catch {
      navigate('/admin/login');
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getGatewaySettings();
      if (res.data.razorpay_key_id) {
        setSettings({
          razorpay_key_id: res.data.razorpay_key_id || '',
          razorpay_key_secret: res.data.razorpay_key_secret || ''
        });
      }
    } catch (e) {
      if (e?.response?.status === 401) {
        navigate('/admin/login');
        return;
      }
      console.error('Failed to load settings:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings.razorpay_key_id.trim() || !settings.razorpay_key_secret.trim()) {
      toast.error('Please enter both Key ID and Secret');
      return;
    }

    setSaving(true);
    try {
      await adminApi.saveGatewaySettings(settings);
      toast.success('Payment gateway settings saved successfully!');
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Payment Gateway Settings</h1>
                <p className="text-gray-600 mt-0.5">Configure Razorpay API credentials</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Warning */}
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900">Security Notice</h3>
                <p className="text-sm text-orange-700 mt-1">
                  For production environments, it's recommended to store API keys as environment variables on the server instead of in the database. This interface is suitable for development and testing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Form */}
        <Card>
          <CardHeader>
            <CardTitle>Razorpay Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading settings...</div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="key_id">Razorpay Key ID</Label>
                  <Input
                    id="key_id"
                    type="text"
                    placeholder="rzp_test_xxxxxxxxxxxxx"
                    value={settings.razorpay_key_id}
                    onChange={(e) => setSettings({ ...settings, razorpay_key_id: e.target.value })}
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500">
                    Your Razorpay Key ID (starts with rzp_test_ or rzp_live_)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="key_secret">Razorpay Key Secret</Label>
                  <div className="relative">
                    <Input
                      id="key_secret"
                      type={showSecret ? 'text' : 'password'}
                      placeholder="Enter your Razorpay Key Secret"
                      value={settings.razorpay_key_secret}
                      onChange={(e) => setSettings({ ...settings, razorpay_key_secret: e.target.value })}
                      className="font-mono pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Your Razorpay Key Secret (keep this confidential)
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">How to get your Razorpay credentials:</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Log in to your Razorpay Dashboard</li>
                    <li>Go to Settings → API Keys</li>
                    <li>Generate keys or use existing ones</li>
                    <li>Copy the Key ID and Key Secret</li>
                    <li>Paste them here and save</li>
                  </ol>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

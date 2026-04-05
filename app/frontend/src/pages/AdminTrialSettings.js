import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import adminApi from '../utils/adminApi';
import { toast } from 'sonner';

export default function AdminTrialSettings() {
  const [days, setDays] = React.useState(7);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.getTrialSettings();
        setDays(res.data.duration_days ?? 7);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.updateTrialSettings(Number(days));
      toast.success('Trial settings updated');
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <Card className="border-0 shadow-xl">
        <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500" />
        <CardHeader>
          <CardTitle>Trial Settings</CardTitle>
          <CardDescription>Control the free trial duration offered to new users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Trial Duration (days)</label>
            <Input type="number" min={0} max={60} value={days} onChange={(e)=>setDays(e.target.value)} className="mt-2 w-40" />
            <p className="text-xs text-gray-500 mt-2">Applies to future trial activations.</p>
          </div>
          <Button onClick={save} disabled={saving || loading} className="bg-amber-600 hover:bg-amber-700">
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}



import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import adminApi from '../utils/adminApi';
import { useNavigate } from 'react-router-dom';
import { Megaphone, BellRing, ShieldAlert } from 'lucide-react';

export default function AdminNotifications() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [filter, setFilter] = useState('all');
  const [ctaType, setCtaType] = useState('');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [sent, setSent] = useState([]);

  const loadSent = async () => {
    try {
      const res = await adminApi.getSentNotifications();
      setSent(res.data.items || []);
    } catch (e) {
      // ignore
    }
  };

  React.useEffect(() => {
    loadSent();
  }, []);

  const applyPreset = (preset) => {
    if (preset === 'promo_10') {
      setTitle('Limited-time Offer: 10% OFF');
      setMessage('Enjoy 10% off your next month when you upgrade today. Offer valid for 48 hours.');
      setType('promo');
      setCtaType('pricing');
    } else if (preset === 'attendance_alert') {
      setTitle('Reminder: Mark Today\'s Attendance');
      setMessage('You have not marked worker attendance for today. Please update attendance to keep records accurate.');
      setType('alert');
      setCtaType('attendance');
    } else if (preset === 'new_feature') {
      setTitle('New Feature: Notification Center');
      setMessage('We\'ve added a new Notification Center in your dashboard. Check it out in the top bar!');
      setType('info');
      setCtaType('');
    }
  };

  const send = async () => {
    if (!title || !message) {
      toast.error('Title and message are required');
      return;
    }
    try {
      const payload = { title, message, type, filter };
      if (ctaType) {
        payload.cta_type = ctaType;
        if (ctaType === 'custom') {
          payload.cta_label = ctaLabel;
          payload.cta_url = ctaUrl;
        }
      }
      const res = await adminApi.sendNotifications(payload);
      toast.success(`Notification sent to ${res.data.sent} users`);
      setTitle(''); setMessage(''); setCtaType(''); setCtaLabel(''); setCtaUrl('');
      await loadSent();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to send notifications');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" onClick={() => navigate(-1)}>← Back</Button>
      </div>
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <CardHeader className="bg-gradient-to-r from-slate-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#3B2ED0] flex items-center justify-center">
                <Megaphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>Broadcast Notifications</CardTitle>
                <CardDescription>Send custom or preset notifications to user segments</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid lg:grid-cols-2 gap-8 p-6">
          {/* Composer */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter title" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Type</label>
              <select className="w-full border rounded-md h-10 px-3" value={type} onChange={(e)=>setType(e.target.value)}>
                <option value="info">Info</option>
                <option value="alert">Alert</option>
                <option value="promo">Promo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Message</label>
            <Textarea rows={6} value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Write your message..." />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Recipients</label>
              <select className="w-full border rounded-md h-10 px-3" value={filter} onChange={(e)=>setFilter(e.target.value)}>
                <option value="all">All Users</option>
                <option value="free">Free Plan</option>
                <option value="trial">Trial Users</option>
                <option value="paid">Paid Users</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">CTA Button (Optional)</label>
              <select className="w-full border rounded-md h-10 px-3" value={ctaType} onChange={(e)=>setCtaType(e.target.value)}>
                <option value="">No Button</option>
                <option value="pricing">View Pricing</option>
                <option value="subscription">Manage Subscription</option>
                <option value="help">Get Help</option>
                <option value="attendance">Mark Attendance</option>
                <option value="custom">Custom Button</option>
              </select>
            </div>
          </div>

          {ctaType === 'custom' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Button Label</label>
                <Input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="e.g., Learn More" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Button URL</label>
                <Input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="e.g., /dashboard" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Presets</div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={()=>applyPreset('promo_10')}><BellRing className="h-4 w-4 mr-2" />Promo: 10% Off</Button>
              <Button type="button" variant="outline" onClick={()=>applyPreset('attendance_alert')}><ShieldAlert className="h-4 w-4 mr-2" />Attendance Alert</Button>
              <Button type="button" variant="outline" onClick={()=>applyPreset('new_feature')}><BellRing className="h-4 w-4 mr-2" />New Feature</Button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Button onClick={send} className="bg-[#3B2ED0] hover:bg-[#2A1FB8]">Send Notification</Button>
          </div>
          {/* Live Preview */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="text-sm font-semibold text-gray-700 mb-3">Preview</div>
            <div className="space-y-3">
              <div className="p-4 rounded-xl border bg-white">
                <div className="flex items-start gap-3">
                  <div className={`h-2 w-2 rounded-full mt-1 ${type === 'alert' ? 'bg-red-600' : type === 'promo' ? 'bg-amber-500' : 'bg-[#3B2ED0]'}`} />
                  <div className="flex-1">
                    <div className="text-sm font-bold text-gray-900">{title || 'Notification title'}</div>
                    <div className="text-xs text-gray-600 mt-1 whitespace-pre-line">{message || 'Write your message...'}</div>
                    {ctaType && (
                      <Button size="sm" className="w-full mt-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold">
                        {ctaType === 'pricing' && 'View Pricing'}
                        {ctaType === 'subscription' && 'Manage Subscription'}
                        {ctaType === 'help' && 'Get Help'}
                        {ctaType === 'attendance' && 'Mark Attendance'}
                        {ctaType === 'custom' && (ctaLabel || 'Custom Button')}
                      </Button>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs capitalize">{type}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card className="mt-6 border-0 shadow-xl">
        <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />
        <CardHeader>
          <CardTitle>Sent Notifications</CardTitle>
          <CardDescription>History of broadcasts</CardDescription>
        </CardHeader>
        <CardContent>
          {sent.length === 0 ? (
            <div className="text-sm text-gray-500">No notifications sent yet.</div>
          ) : (
            <div className="space-y-3">
              {sent.map(item => (
                <div key={item.broadcast_id} className="p-4 rounded-xl border flex items-start justify-between bg-white">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{item.title} <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 capitalize">{item.type}</span></div>
                    <div className="text-xs text-gray-600 mt-1 whitespace-pre-line">{item.message}</div>
                    <div className="text-xs text-gray-500 mt-2">Filter: {item.filter} • Sent: {item.sent} • {new Date(item.created_at).toLocaleString()}</div>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={async ()=>{ await adminApi.deleteBroadcast(item.broadcast_id); toast.success('Deleted'); loadSent(); }}
                  >Delete</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import adminApi from '../utils/adminApi';
import { useNavigate } from 'react-router-dom';
import { Gift, Percent, DollarSign, Users, Calendar, Target, Trash2, Edit, Plus, CheckCircle, XCircle } from 'lucide-react';

export default function AdminPromotions() {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState([]);
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    target_category: 'all',
    custom_user_ids: [],
    plan_targets: [],
    valid_from: new Date().toISOString().slice(0, 16),
    valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    max_uses: null,
    send_notification: true,
    notification_title: '',
    notification_message: '',
    active: true
  });

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  useEffect(() => {
    loadPromotions();
    loadUsers();
    loadPlans();
  }, []);

  const loadPromotions = async () => {
    try {
      const res = await adminApi.getPromotions(false);
      setPromotions(res.data.promotions || []);
    } catch (e) {
      console.error('Failed to load promotions', e);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await adminApi.getUsersForPromotion();
      setUsers(res.data.users || []);
    } catch (e) {
      console.error('Failed to load users', e);
    }
  };

  const loadPlans = async () => {
    try {
      const res = await adminApi.getAllPlans(true);
      setPlans(res.data.plans || []);
    } catch (e) {
      console.error('Failed to load plans', e);
    }
  };

  const handleCreatePromotion = async () => {
    if (!formData.name || !formData.description) {
      toast.error('Name and description are required');
      return;
    }

    if (formData.discount_value <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_until: new Date(formData.valid_until).toISOString(),
        custom_user_ids: formData.target_category === 'custom_users' ? selectedUsers : [],
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null
      };

      const res = await adminApi.createPromotion(payload);
      toast.success(`Promotion created! ${res.data.eligible_users} users eligible, ${res.data.notifications_sent} notifications sent`);
      
      setShowCreateDialog(false);
      resetForm();
      loadPromotions();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to create promotion');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePromotion = async (promotionId) => {
    if (!window.confirm('Are you sure you want to delete this promotion?')) return;
    
    try {
      await adminApi.deletePromotion(promotionId);
      toast.success('Promotion deleted successfully');
      loadPromotions();
    } catch (e) {
      toast.error('Failed to delete promotion');
    }
  };

  const handleToggleActive = async (promotion) => {
    try {
      await adminApi.updatePromotion(promotion.id, { active: !promotion.active });
      toast.success(`Promotion ${!promotion.active ? 'activated' : 'deactivated'}`);
      loadPromotions();
    } catch (e) {
      toast.error('Failed to update promotion');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      target_category: 'all',
      custom_user_ids: [],
      plan_targets: [],
      valid_from: new Date().toISOString().slice(0, 16),
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      max_uses: null,
      send_notification: true,
      notification_title: '',
      notification_message: '',
      active: true
    });
    setSelectedUsers([]);
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const categoryLabels = {
    all: 'All Users',
    free_users: 'Free Plan Users',
    trial_users: 'Trial Users',
    paid_users: 'Paid Users',
    cancelled_users: 'Cancelled Subscriptions',
    expired_trial: 'Expired Trial Users',
    low_activity: 'Low Activity (7+ days)',
    custom_users: 'Custom User Selection'
  };

  const discountTypeLabels = {
    percentage: 'Percentage Discount',
    fixed_amount: 'Fixed Amount Off',
    custom_price: 'Custom Price'
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>← Back</Button>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#3B2ED0] hover:bg-[#2A1FB8]">
              <Plus className="h-4 w-4 mr-2" />
              Create Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Promotion/Offer</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Promotion Name *</label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Summer Sale 2026"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Target Category *</label>
                  <select 
                    className="w-full border rounded-md h-10 px-3"
                    value={formData.target_category}
                    onChange={(e) => setFormData({...formData, target_category: e.target.value})}
                  >
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Description *</label>
                <Textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the promotion..."
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Discount Type *</label>
                  <select 
                    className="w-full border rounded-md h-10 px-3"
                    value={formData.discount_type}
                    onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                  >
                    {Object.entries(discountTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {formData.discount_type === 'percentage' ? 'Percentage (%)' : 
                     formData.discount_type === 'fixed_amount' ? 'Amount (₹)' : 'Custom Price (₹)'} *
                  </label>
                  <Input 
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({...formData, discount_value: parseFloat(e.target.value)})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Max Uses (Optional)</label>
                  <Input 
                    type="number"
                    value={formData.max_uses || ''}
                    onChange={(e) => setFormData({...formData, max_uses: e.target.value ? parseInt(e.target.value) : null})}
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Valid From *</label>
                  <Input 
                    type="datetime-local"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Valid Until *</label>
                  <Input 
                    type="datetime-local"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Target Plans (Optional)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {plans.map(plan => (
                    <label key={plan.name} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={formData.plan_targets.includes(plan.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, plan_targets: [...formData.plan_targets, plan.name]});
                          } else {
                            setFormData({...formData, plan_targets: formData.plan_targets.filter(p => p !== plan.name)});
                          }
                        }}
                      />
                      <span className="text-sm">{plan.name} (₹{plan.price}/mo)</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Leave empty to apply to all plans</p>
              </div>

              {formData.target_category === 'custom_users' && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Select Users</label>
                  <Input 
                    placeholder="Search users..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="mb-3"
                  />
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {filteredUsers.map(user => (
                      <div 
                        key={user.id}
                        onClick={() => toggleUserSelection(user.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedUsers.includes(user.id) ? 'bg-[#3B2ED0] text-white' : 'bg-white hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{user.name}</div>
                            <div className="text-xs opacity-80">{user.email}</div>
                          </div>
                          <Badge variant="outline" className={selectedUsers.includes(user.id) ? 'border-white text-white' : ''}>
                            {user.subscription_plan || 'Free'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{selectedUsers.length} user(s) selected</p>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <input 
                    type="checkbox"
                    checked={formData.send_notification}
                    onChange={(e) => setFormData({...formData, send_notification: e.target.checked})}
                    id="send_notification"
                  />
                  <label htmlFor="send_notification" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Send Notification to Users
                  </label>
                </div>

                {formData.send_notification && (
                  <div className="space-y-3 ml-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Notification Title (Optional)</label>
                      <Input 
                        value={formData.notification_title}
                        onChange={(e) => setFormData({...formData, notification_title: e.target.value})}
                        placeholder={`Special Offer: ${formData.name || 'Promotion Name'}`}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Notification Message (Optional)</label>
                      <Textarea 
                        rows={2}
                        value={formData.notification_message}
                        onChange={(e) => setFormData({...formData, notification_message: e.target.value})}
                        placeholder={formData.description || 'Promotion description will be used'}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button 
                  onClick={handleCreatePromotion}
                  disabled={loading}
                  className="bg-[#3B2ED0] hover:bg-[#2A1FB8]"
                >
                  {loading ? 'Creating...' : 'Create Promotion'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
        <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#3B2ED0] flex items-center justify-center">
              <Gift className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Promotions & Offers</CardTitle>
              <CardDescription>Create and manage special offers for users</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {promotions.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No promotions created yet</p>
              <p className="text-sm text-gray-400 mt-1">Click "Create Promotion" to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {promotions.map(promo => (
                <Card key={promo.id} className={`border-2 ${promo.active ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-gray-50'}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{promo.name}</h3>
                          <Badge variant={promo.active ? 'default' : 'secondary'} className={promo.active ? 'bg-green-600' : ''}>
                            {promo.active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">
                            {categoryLabels[promo.target_category]}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{promo.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            {promo.discount_type === 'percentage' ? <Percent className="h-4 w-4 text-purple-600" /> : <DollarSign className="h-4 w-4 text-green-600" />}
                            <div>
                              <div className="text-xs text-gray-500">Discount</div>
                              <div className="font-semibold">
                                {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `₹${promo.discount_value}`}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            <div>
                              <div className="text-xs text-gray-500">Eligible Users</div>
                              <div className="font-semibold">{promo.eligible_user_ids?.length || 0}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-orange-600" />
                            <div>
                              <div className="text-xs text-gray-500">Valid Until</div>
                              <div className="font-semibold">{new Date(promo.valid_until).toLocaleDateString()}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-pink-600" />
                            <div>
                              <div className="text-xs text-gray-500">Uses</div>
                              <div className="font-semibold">
                                {promo.current_uses || 0} / {promo.max_uses || '∞'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {promo.plan_targets && promo.plan_targets.length > 0 && (
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs text-gray-500">Target Plans:</span>
                            {promo.plan_targets.map(plan => (
                              <Badge key={plan} variant="outline" className="text-xs">{plan}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(promo)}
                          className={promo.active ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-green-300 text-green-600 hover:bg-green-50'}
                        >
                          {promo.active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeletePromotion(promo.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

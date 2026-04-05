import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';
import adminApi from '../utils/adminApi';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Plus, Edit, Trash2, Calendar, Tag, Percent, DollarSign,
  Clock, Eye, EyeOff, RefreshCw, AlertCircle, PartyPopper
} from 'lucide-react';

const AdminSiteOffers = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    offer_reason: '',
    discount_type: 'percentage',
    discount_value: '',
    plan_targets: [],
    valid_from: '',
    valid_until: '',
    badge_text: '',
    badge_color: 'red',
    show_countdown: false,
    active: true
  });

  useEffect(() => {
    loadOffers();
    loadPlans();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getSiteOffers(false);
      setOffers(res.data.offers || []);
    } catch (e) {
      console.error('Failed to load site offers', e);
      toast.error('Failed to load site offers');
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      const res = await adminApi.getAllPlans(false);
      setPlans(res.data.plans || []);
    } catch (e) {
      console.error('Failed to load plans', e);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      offer_reason: '',
      discount_type: 'percentage',
      discount_value: '',
      plan_targets: [],
      valid_from: '',
      valid_until: '',
      badge_text: '',
      badge_color: 'red',
      show_countdown: false,
      active: true
    });
    setEditingOffer(null);
    setShowCreateForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_until: new Date(formData.valid_until).toISOString()
      };

      if (editingOffer) {
        await adminApi.updateSiteOffer(editingOffer.id, {
          name: payload.name,
          description: payload.description,
          valid_until: payload.valid_until,
          active: payload.active,
          badge_text: payload.badge_text,
          show_countdown: payload.show_countdown
        });
        toast.success('Site offer updated successfully');
      } else {
        await adminApi.createSiteOffer(payload);
        toast.success('Site offer created successfully');
      }
      
      resetForm();
      loadOffers();
    } catch (e) {
      console.error('Failed to save site offer', e);
      toast.error(e.response?.data?.detail || 'Failed to save site offer');
    }
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      name: offer.name,
      description: offer.description,
      offer_reason: offer.offer_reason,
      discount_type: offer.discount_type,
      discount_value: offer.discount_value.toString(),
      plan_targets: offer.plan_targets || [],
      valid_from: offer.valid_from.split('T')[0] + 'T' + offer.valid_from.split('T')[1].substring(0, 5),
      valid_until: offer.valid_until.split('T')[0] + 'T' + offer.valid_until.split('T')[1].substring(0, 5),
      badge_text: offer.badge_text || '',
      badge_color: offer.badge_color || 'red',
      show_countdown: offer.show_countdown || false,
      active: offer.active
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this site offer?')) return;
    
    try {
      await adminApi.deleteSiteOffer(offerId);
      toast.success('Site offer deleted successfully');
      loadOffers();
    } catch (e) {
      console.error('Failed to delete site offer', e);
      toast.error('Failed to delete site offer');
    }
  };

  const toggleActive = async (offer) => {
    try {
      await adminApi.updateSiteOffer(offer.id, { active: !offer.active });
      toast.success(`Offer ${!offer.active ? 'activated' : 'deactivated'}`);
      loadOffers();
    } catch (e) {
      console.error('Failed to toggle offer', e);
      toast.error('Failed to toggle offer');
    }
  };

  const getBadgeColorClass = (color) => {
    const colors = {
      red: 'bg-red-100 text-red-700 border-red-300',
      orange: 'bg-orange-100 text-orange-700 border-orange-300',
      green: 'bg-green-100 text-green-700 border-green-300',
      blue: 'bg-blue-100 text-blue-700 border-blue-300',
      purple: 'bg-purple-100 text-purple-700 border-purple-300'
    };
    return colors[color] || colors.red;
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-yellow-500" />
              Site-Wide Offers
            </h1>
            <p className="text-gray-600 mt-1">Festival & seasonal promotions visible to all visitors</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadOffers} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={() => setShowCreateForm(!showCreateForm)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Offer
            </Button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">About Site-Wide Offers</p>
              <p>These offers are displayed to ALL visitors (registered and non-registered) on the pricing page. Perfect for Black Friday, Diwali, New Year, and other festival/seasonal promotions. Prices are crossed out and discounted prices are highlighted.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PartyPopper className="h-5 w-5" />
              {editingOffer ? 'Edit Site Offer' : 'Create New Site Offer'}
            </CardTitle>
            <CardDescription>
              {editingOffer ? 'Update offer details' : 'Create a festival or seasonal promotion visible to all visitors'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Offer Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Black Friday Sale"
                    required
                    disabled={editingOffer}
                  />
                </div>

                <div>
                  <Label htmlFor="offer_reason">Offer Reason *</Label>
                  <Input
                    id="offer_reason"
                    value={formData.offer_reason}
                    onChange={(e) => setFormData({...formData, offer_reason: e.target.value})}
                    placeholder="e.g., Black Friday, Diwali Festival"
                    required
                    disabled={editingOffer}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the offer..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount_type">Discount Type *</Label>
                  <select
                    id="discount_type"
                    value={formData.discount_type}
                    onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    disabled={editingOffer}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="discount_value">
                    Discount Value * {formData.discount_type === 'percentage' ? '(%)' : '(₹)'}
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    step="0.01"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                    placeholder={formData.discount_type === 'percentage' ? 'e.g., 30' : 'e.g., 500'}
                    required
                    disabled={editingOffer}
                  />
                </div>
              </div>

              <div>
                <Label>Target Plans (leave empty for all plans)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {plans.map(plan => (
                    <label key={plan.id} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50">
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
                        disabled={editingOffer}
                      />
                      <span className="text-sm">{plan.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valid_from">Valid From *</Label>
                  <Input
                    id="valid_from"
                    type="datetime-local"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                    required
                    disabled={editingOffer}
                  />
                </div>

                <div>
                  <Label htmlFor="valid_until">Valid Until *</Label>
                  <Input
                    id="valid_until"
                    type="datetime-local"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="badge_text">Badge Text (optional)</Label>
                  <Input
                    id="badge_text"
                    value={formData.badge_text}
                    onChange={(e) => setFormData({...formData, badge_text: e.target.value})}
                    placeholder="e.g., 30% OFF, Limited Time"
                    maxLength={50}
                  />
                </div>

                <div>
                  <Label htmlFor="badge_color">Badge Color</Label>
                  <select
                    id="badge_color"
                    value={formData.badge_color}
                    onChange={(e) => setFormData({...formData, badge_color: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="red">Red</option>
                    <option value="orange">Orange</option>
                    <option value="green">Green</option>
                    <option value="blue">Blue</option>
                    <option value="purple">Purple</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.show_countdown}
                    onCheckedChange={(checked) => setFormData({...formData, show_countdown: checked})}
                  />
                  <Label>Show Countdown Timer</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({...formData, active: checked})}
                  />
                  <Label>Active</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="gap-2">
                  {editingOffer ? 'Update Offer' : 'Create Offer'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Offers List */}
      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Loading offers...</p>
          </CardContent>
        </Card>
      ) : offers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No site-wide offers created yet</p>
            <Button onClick={() => setShowCreateForm(true)} className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Create First Offer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <Card key={offer.id} className={!offer.active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{offer.name}</CardTitle>
                      {offer.badge_text && (
                        <Badge className={getBadgeColorClass(offer.badge_color)}>
                          {offer.badge_text}
                        </Badge>
                      )}
                      {offer.active ? (
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>
                      )}
                    </div>
                    <CardDescription>{offer.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleActive(offer)}
                      className="gap-2"
                    >
                      {offer.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(offer)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(offer.id)}
                      className="gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Reason</p>
                      <p className="font-semibold">{offer.offer_reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {offer.discount_type === 'percentage' ? (
                      <Percent className="h-4 w-4 text-green-600" />
                    ) : (
                      <DollarSign className="h-4 w-4 text-green-600" />
                    )}
                    <div>
                      <p className="text-xs text-gray-600">Discount</p>
                      <p className="font-semibold">
                        {offer.discount_type === 'percentage' ? `${offer.discount_value}%` : `₹${offer.discount_value}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-600">Valid From</p>
                      <p className="font-semibold text-sm">{formatDate(offer.valid_from)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-xs text-gray-600">Valid Until</p>
                      <p className="font-semibold text-sm">{formatDate(offer.valid_until)}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3 mt-3">
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Target Plans:</span>{' '}
                      {offer.plan_targets?.length > 0 ? offer.plan_targets.join(', ') : 'All Plans'}
                    </div>
                    {offer.show_countdown && (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Countdown Enabled
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSiteOffers;

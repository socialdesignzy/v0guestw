import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { 
  ArrowLeft, Plus, Edit, Trash2, Users, IndianRupee, Calendar,
  Check, X, RefreshCw, Award, TrendingUp, Key, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import adminApi from '../utils/adminApi';

// Plan Form Dialog Component (moved outside to prevent re-creation on every render)
const PlanFormDialog = ({ 
  isEdit, 
  formData, 
  setFormData, 
  addFeature, 
  updateFeature, 
  removeFeature, 
  handleCreatePlan, 
  handleUpdatePlan, 
  setCreateDialogOpen, 
  setEditDialogOpen, 
  resetForm,
  selectedPlan,
  onCreateRazorpayPlan
}) => {
  const [creatingRazorpay, setCreatingRazorpay] = useState(false);

  return (
  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>{isEdit ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
    </DialogHeader>
    <div className="space-y-4 mt-4">
      <div>
        <Label htmlFor="plan-name">Plan Name *</Label>
        <Input
          id="plan-name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="e.g., Professional Plan"
          autoFocus
          autoComplete="off"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="plan-price">Price (₹) *</Label>
          <Input
            id="plan-price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
            autoComplete="off"
          />
        </div>
        <div>
          <Label htmlFor="plan-duration">Duration (Days) *</Label>
          <Input
            id="plan-duration"
            type="number"
            value={formData.duration_days}
            onChange={(e) => setFormData({...formData, duration_days: parseInt(e.target.value)})}
            autoComplete="off"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="plan-razorpay">Razorpay Plan ID <span className="text-gray-500 font-normal">(optional, for recurring subscriptions)</span></Label>
        <Input
          id="plan-razorpay"
          value={formData.razorpay_plan_id || ''}
          onChange={(e) => setFormData({...formData, razorpay_plan_id: e.target.value})}
          placeholder="e.g. plan_xxxx — from Razorpay Dashboard or use Create in Razorpay"
          autoComplete="off"
          className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
          Required for Razorpay recurring subscriptions. Create a plan in Razorpay Dashboard and paste the ID, or use &quot;Create in Razorpay&quot; (creates a monthly plan with this price).
        </p>
        {isEdit && selectedPlan && !(formData.razorpay_plan_id || '').trim() && onCreateRazorpayPlan && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            disabled={creatingRazorpay}
            onClick={async () => {
              setCreatingRazorpay(true);
              try {
                const res = await onCreateRazorpayPlan(selectedPlan.id);
                const id = res?.data?.razorpay_plan_id || res?.razorpay_plan_id;
                if (id) {
                  setFormData({ ...formData, razorpay_plan_id: id });
                  toast.success('Razorpay plan created and linked');
                }
              } catch (e) {
                toast.error(e.response?.data?.detail || 'Failed to create Razorpay plan');
              } finally {
                setCreatingRazorpay(false);
              }
            }}
          >
            {creatingRazorpay ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Key className="h-4 w-4 mr-2" />}
            Create in Razorpay
          </Button>
        )}
      </div>

      <div>
        <Label htmlFor="plan-description">Description</Label>
        <Textarea
          id="plan-description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Brief description of the plan..."
          rows={3}
          autoComplete="off"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Features</Label>
          <Button type="button" variant="outline" size="sm" onClick={addFeature}>
            <Plus className="h-4 w-4 mr-1" />
            Add Feature
          </Button>
        </div>
        <div className="space-y-2">
          {formData.features.map((feature, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                placeholder={`Feature ${index + 1}`}
                autoComplete="off"
              />
              {formData.features.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFeature(index)}
                  className="text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
          className="h-4 w-4"
        />
        <Label htmlFor="is_active" className="cursor-pointer">
          Active (visible to users)
        </Label>
      </div>
    </div>
    <DialogFooter className="mt-6">
      <Button 
        variant="outline" 
        onClick={() => {
          isEdit ? setEditDialogOpen(false) : setCreateDialogOpen(false);
          resetForm();
        }}
      >
        Cancel
      </Button>
      <Button 
        onClick={isEdit ? handleUpdatePlan : handleCreatePlan}
        className="bg-[#3B2ED0] hover:bg-[#2A1FB8]"
      >
        {isEdit ? 'Update Plan' : 'Create Plan'}
      </Button>
    </DialogFooter>
  </DialogContent>
  );
};

export default function PlanManagement() {
  const navigate = useNavigate();
  
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [creatingRpPlanId, setCreatingRpPlanId] = useState(null);
  
  // Form for creating/editing plans
  const [formData, setFormData] = useState({
    name: '',
    price: 999,
    duration_days: 30,
    features: [''],
    description: '',
    is_active: true,
    razorpay_plan_id: ''
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllPlans(true); // Include inactive
      setPlans(response.data.plans || []);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    try {
      // Filter out empty features
      const planData = {
        ...formData,
        features: formData.features.filter(f => f.trim() !== '')
      };
      
      if (!planData.name.trim()) {
        toast.error('Plan name is required');
        return;
      }
      
      await adminApi.createPlan(planData);
      toast.success('Plan created successfully!');
      setCreateDialogOpen(false);
      fetchPlans();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create plan');
    }
  };

  const handleUpdatePlan = async () => {
    try {
      if (!selectedPlan) return;
      
      const planData = {
        ...formData,
        features: formData.features.filter(f => f.trim() !== '')
      };
      
      await adminApi.updatePlan(selectedPlan.id, planData);
      toast.success('Plan updated successfully!');
      setEditDialogOpen(false);
      fetchPlans();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update plan');
    }
  };

  const handleDeletePlan = async () => {
    try {
      if (!selectedPlan) return;
      
      await adminApi.deletePlan(selectedPlan.id);
      toast.success('Plan deleted successfully!');
      setDeleteDialogOpen(false);
      setSelectedPlan(null);
      fetchPlans();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete plan');
    }
  };

  const openEditDialog = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      duration_days: plan.duration_days,
      features: plan.features && plan.features.length > 0 ? plan.features : [''],
      description: plan.description || '',
      is_active: plan.is_active,
      razorpay_plan_id: plan.razorpay_plan_id || ''
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (plan) => {
    setSelectedPlan(plan);
    setDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: 999,
      duration_days: 30,
      features: [''],
      description: '',
      is_active: true,
      razorpay_plan_id: ''
    });
    setSelectedPlan(null);
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    });
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({
      ...formData,
      features: newFeatures
    });
  };

  const removeFeature = (index) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        features: newFeatures
      });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br bg-[#F8FAFF] p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Award className="h-10 w-10 text-[#3B2ED0]" />
              Subscription Plans
            </h1>
            <p className="text-gray-600 mt-2">Create and manage subscription plans</p>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#3B2ED0] hover:bg-[#2A1FB8]" onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Plan
              </Button>
            </DialogTrigger>
            {createDialogOpen && (
              <PlanFormDialog 
                isEdit={false}
                formData={formData}
                setFormData={setFormData}
                addFeature={addFeature}
                updateFeature={updateFeature}
                removeFeature={removeFeature}
                handleCreatePlan={handleCreatePlan}
                handleUpdatePlan={handleUpdatePlan}
                setCreateDialogOpen={setCreateDialogOpen}
                setEditDialogOpen={setEditDialogOpen}
                resetForm={resetForm}
                selectedPlan={null}
                onCreateRazorpayPlan={async (planId) => { const res = await adminApi.createRazorpayPlanForPlan(planId); return res; }}
              />
            )}
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Plans</p>
                <p className="text-3xl font-bold text-[#3B2ED0]">{plans.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <Award className="h-6 w-6 text-[#3B2ED0]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Plans</p>
                <p className="text-3xl font-bold text-green-600">
                  {plans.filter(p => p.is_active).length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Subscribers</p>
                <p className="text-3xl font-bold text-blue-600">
                  {plans.reduce((sum, p) => sum + (p.subscriber_count || 0), 0)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg. Price</p>
                <p className="text-3xl font-bold text-purple-600">
                  {plans.length > 0 ? formatPrice(plans.reduce((sum, p) => sum + p.price, 0) / plans.length) : '₹0'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Subscription Plans</CardTitle>
          <CardDescription>Manage pricing, features, and availability</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Subscribers</TableHead>
                  <TableHead>Razorpay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                    </TableCell>
                  </TableRow>
                ) : plans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No plans found. Create your first plan!
                    </TableCell>
                  </TableRow>
                ) : (
                  plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div>
                          <div className="font-semibold text-gray-900">{plan.name}</div>
                          {plan.description && (
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {plan.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-semibold text-[#3B2ED0]">
                          <IndianRupee className="h-4 w-4" />
                          {plan.price}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {plan.duration_days} days
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {plan.features && plan.features.length > 0 ? (
                            <ul className="text-sm text-gray-600 space-y-1">
                              {plan.features.slice(0, 2).map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-1">
                                  <Check className="h-3 w-3 text-green-600" />
                                  {feature}
                                </li>
                              ))}
                              {plan.features.length > 2 && (
                                <li className="text-xs text-blue-600">
                                  +{plan.features.length - 2} more
                                </li>
                              )}
                            </ul>
                          ) : (
                            <span className="text-sm text-gray-400">No features</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold">{plan.subscriber_count || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {plan.razorpay_plan_id ? (
                          <Badge className="bg-green-500">Linked</Badge>
                        ) : (
                          <Badge variant="secondary">Not linked</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {plan.is_active ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-500">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(plan)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!plan.razorpay_plan_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                setCreatingRpPlanId(plan.id);
                                try {
                                  await adminApi.createRazorpayPlanForPlan(plan.id);
                                  toast.success('Razorpay plan created and linked');
                                  fetchPlans();
                                } catch (e) {
                                  toast.error(e.response?.data?.detail || 'Failed to create Razorpay plan');
                                } finally {
                                  setCreatingRpPlanId(null);
                                }
                              }}
                              disabled={creatingRpPlanId === plan.id}
                              className="text-amber-600 hover:text-amber-700"
                              title="Create in Razorpay"
                            >
                              {creatingRpPlanId === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(plan)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        {editDialogOpen && (
          <PlanFormDialog 
            isEdit={true}
            formData={formData}
            setFormData={setFormData}
            addFeature={addFeature}
            updateFeature={updateFeature}
            removeFeature={removeFeature}
            handleCreatePlan={handleCreatePlan}
            handleUpdatePlan={handleUpdatePlan}
            setCreateDialogOpen={setCreateDialogOpen}
            setEditDialogOpen={setEditDialogOpen}
            resetForm={resetForm}
            selectedPlan={selectedPlan}
            onCreateRazorpayPlan={async (planId) => { const res = await adminApi.createRazorpayPlanForPlan(planId); return res; }}
          />
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedPlan?.name}"? 
              {selectedPlan?.subscriber_count > 0 && (
                <span className="block mt-2 text-red-600 font-semibold">
                  Warning: {selectedPlan.subscriber_count} active subscribers are using this plan!
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePlan}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


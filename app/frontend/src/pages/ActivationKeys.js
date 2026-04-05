import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { 
  Key, Plus, ArrowLeft, Copy, Check, Trash2, ToggleLeft, ToggleRight,
  Gift, Ticket, Calendar, RefreshCw, AlertCircle, Users
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

export default function ActivationKeys() {
  const navigate = useNavigate();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('activation');
  
  // Activation Keys
  const [activationKeys, setActivationKeys] = useState([]);
  const [loadingActivation, setLoadingActivation] = useState(true);
  
  // Extension Keys
  const [extensionKeys, setExtensionKeys] = useState([]);
  const [loadingExtension, setLoadingExtension] = useState(true);
  
  // Promo Codes
  const [promoCodes, setPromoCodes] = useState([]);
  const [loadingPromos, setLoadingPromos] = useState(true);
  
  // Dialog states
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  
  // Form states for different key types
  const [activationForm, setActivationForm] = useState({
    plan: 'Contractor Plus',
    max_uses: 1,
    duration_days: 30,
    notes: '',
    is_paid: false
  });
  
  const [extensionForm, setExtensionForm] = useState({
    plan: '', // Optional - can be left empty for all plans
    duration_days: 30,
    max_uses: 1,
    notes: '',
    expiry_date: ''
  });
  
  const [promoForm, setPromoForm] = useState({
    code: '',
    plan: '', // Optional - can be left empty for all plans
    discount_type: 'percentage',
    discount_value: 10,
    max_uses: 0,
    description: '',
    expiry_date: ''
  });

  useEffect(() => {
    fetchActivationKeys();
    fetchExtensionKeys();
    fetchPromoCodes();
  }, []);

  const fetchActivationKeys = async () => {
    try {
      setLoadingActivation(true);
      const response = await adminApi.getActivationKeys();
      setActivationKeys(response.data.keys || []);
    } catch (error) {
      console.error('Failed to fetch activation keys:', error);
      toast.error('Failed to load activation keys');
    } finally {
      setLoadingActivation(false);
    }
  };

  const fetchExtensionKeys = async () => {
    try {
      setLoadingExtension(true);
      const response = await adminApi.getExtensionKeys();
      setExtensionKeys(response.data.keys || []);
    } catch (error) {
      console.error('Failed to fetch extension keys:', error);
      toast.error('Failed to load extension keys');
    } finally {
      setLoadingExtension(false);
    }
  };

  const fetchPromoCodes = async () => {
    try {
      setLoadingPromos(true);
      console.log('Fetching promo codes...');
      const response = await adminApi.getPromoCodes();
      console.log('Promo codes response:', response.data);
      const codes = response.data.promo_codes || [];
      console.log('Setting promo codes:', codes.length, 'codes');
      setPromoCodes(codes);
      if (codes.length === 0) {
        console.log('No promo codes found in database');
      }
    } catch (error) {
      console.error('Failed to fetch promo codes:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to load promo codes: ' + (error.response?.data?.detail || error.message));
      setPromoCodes([]);
    } finally {
      setLoadingPromos(false);
    }
  };

  const handleGenerateActivationKey = async () => {
    try {
      const response = await adminApi.generateActivationKey(activationForm);
      toast.success(`Activation key generated: ${response.data.key}`);
      setGenerateDialogOpen(false);
      fetchActivationKeys();
      // Reset form
      setActivationForm({
        plan: 'Contractor Plus',
        max_uses: 1,
        duration_days: 30,
        notes: '',
        is_paid: false
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate activation key');
    }
  };

  const handleGenerateExtensionKey = async () => {
    try {
      const response = await adminApi.generateExtensionKey(extensionForm);
      toast.success(`Extension key generated: ${response.data.key}`);
      setGenerateDialogOpen(false);
      fetchExtensionKeys();
      setExtensionForm({
        plan: '',
        duration_days: 30,
        max_uses: 1,
        notes: '',
        expiry_date: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate extension key');
    }
  };

  const handleGeneratePromoCode = async () => {
    try {
      const payload = {
        ...promoForm,
        discount_value: Number(promoForm.discount_value) || 0,
        max_uses: Math.max(0, parseInt(String(promoForm.max_uses), 10) || 0),
        expiry_date: promoForm.expiry_date?.trim() || undefined
      };
      const response = await adminApi.generatePromoCode(payload);
      toast.success(`Promo code generated: ${response.data.code}`);
      setGenerateDialogOpen(false);
      fetchPromoCodes();
      setPromoForm({
        code: '',
        plan: '',
        discount_type: 'percentage',
        discount_value: 10,
        max_uses: 0,
        description: '',
        expiry_date: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate promo code');
    }
  };

  const handleToggle = async (id, type) => {
    try {
      if (type === 'activation') {
        await adminApi.toggleActivationKey(id);
        fetchActivationKeys();
      } else if (type === 'extension') {
        await adminApi.toggleExtensionKey(id);
        fetchExtensionKeys();
      } else if (type === 'promo') {
        await adminApi.togglePromoCode(id);
        fetchPromoCodes();
      }
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    
    try {
      if (selectedItem.type === 'activation') {
        await adminApi.deleteActivationKey(selectedItem.id);
        fetchActivationKeys();
      } else if (selectedItem.type === 'extension') {
        await adminApi.deleteExtensionKey(selectedItem.id);
        fetchExtensionKeys();
      } else if (selectedItem.type === 'promo') {
        await adminApi.deletePromoCode(selectedItem.id);
        fetchPromoCodes();
      }
      toast.success('Deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast.success('Key copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getStatusBadge = (item, type) => {
    if (type === 'promo' && item.is_expired) {
      return <Badge className="bg-red-500">Expired</Badge>;
    }
    if (type === 'promo' && item.is_exhausted) {
      return <Badge className="bg-orange-500">Exhausted</Badge>;
    }
    if (item.is_active) {
      return <Badge className="bg-green-500">Active</Badge>;
    }
    return <Badge className="bg-gray-500">Inactive</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br bg-[#F8FAFF] p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Key className="h-10 w-10 text-[#3B2ED0]" />
              Key Management
            </h1>
            <p className="text-gray-600 mt-2">Manage activation keys, extensions, and promo codes</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="activation" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Activation Keys
          </TabsTrigger>
          <TabsTrigger value="extension" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Extension Keys
          </TabsTrigger>
          <TabsTrigger value="promo" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Promo Codes
          </TabsTrigger>
        </TabsList>

        {/* ACTIVATION KEYS TAB */}
        <TabsContent value="activation" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="grid grid-cols-3 gap-4 flex-1 mr-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-[#3B2ED0]">
                    {activationKeys.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Keys</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {activationKeys.filter(k => k.is_active && k.current_uses < k.max_uses).length}
                  </div>
                  <div className="text-sm text-gray-600">Active</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {activationKeys.filter(k => k.current_uses >= k.max_uses).length}
                  </div>
                  <div className="text-sm text-gray-600">Exhausted</div>
                </CardContent>
              </Card>
            </div>
            
            <Dialog open={generateDialogOpen && activeTab === 'activation'} onOpenChange={setGenerateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#3B2ED0] hover:bg-[#2A1FB8]">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Activation Key</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Plan Name *</Label>
                    <Select
                      value={activationForm.plan}
                      onValueChange={(value) => setActivationForm({...activationForm, plan: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Contractor Plus">Contractor Plus</SelectItem>
                        <SelectItem value="Contractor Pro">Contractor Pro</SelectItem>
                        <SelectItem value="Enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Max Uses</Label>
                    <Input
                      type="number"
                      value={activationForm.max_uses}
                      onChange={(e) => setActivationForm({...activationForm, max_uses: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Duration (Days)</Label>
                    <Input
                      type="number"
                      value={activationForm.duration_days}
                      onChange={(e) => setActivationForm({...activationForm, duration_days: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Payment</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="is_paid"
                          checked={activationForm.is_paid === true}
                          onChange={() => setActivationForm({...activationForm, is_paid: true})}
                          className="h-4 w-4"
                        />
                        <span>Paid</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="is_paid"
                          checked={activationForm.is_paid === false}
                          onChange={() => setActivationForm({...activationForm, is_paid: false})}
                          className="h-4 w-4"
                        />
                        <span>Not paid</span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">If Paid: user pays you manually; redemption counts as platform revenue (plan price).</p>
                  </div>
                  <div>
                    <Label>Notes (Optional)</Label>
                    <Textarea
                      value={activationForm.notes}
                      onChange={(e) => setActivationForm({...activationForm, notes: e.target.value})}
                      placeholder="Add notes about this key..."
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleGenerateActivationKey} className="bg-[#3B2ED0] hover:bg-[#2A1FB8]">
                    Generate
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Used By</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingActivation ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                        </TableCell>
                      </TableRow>
                    ) : activationKeys.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                          No activation keys found
                        </TableCell>
                      </TableRow>
                    ) : (
                      activationKeys.map((key) => (
                        <TableRow key={key.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="px-2 py-1 bg-gray-100 rounded font-mono text-xs">
                                {key.key}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyKey(key.key)}
                              >
                                {copiedKey === key.key ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>{key.plan}</TableCell>
                          <TableCell>
                            {key.is_paid ? (
                              <Badge className="bg-green-600">Paid</Badge>
                            ) : (
                              <Badge variant="secondary">Not paid</Badge>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(key, 'activation')}</TableCell>
                          <TableCell>{key.current_uses} / {key.max_uses}</TableCell>
                          <TableCell>
                            {key.used_by && key.used_by.length > 0 ? (
                              <div className="space-y-1">
                                {key.used_by.slice(0, 1).map((user, idx) => (
                                  <div key={idx} className="text-sm">
                                    <div className="font-medium">{user.user_name}</div>
                                    <div className="text-xs text-gray-500">{user.user_email}</div>
                                  </div>
                                ))}
                                {key.used_by.length > 1 && (
                                  <div className="text-xs text-blue-600">+{key.used_by.length - 1} more</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">Not used</span>
                            )}
                          </TableCell>
                          <TableCell>{key.duration_days} days</TableCell>
                          <TableCell>{formatDate(key.created_at)}</TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate text-sm text-gray-600">
                              {key.notes || '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggle(key.id, 'activation')}
                              >
                                {key.is_active ? (
                                  <ToggleRight className="h-4 w-4 text-green-600" />
                                ) : (
                                  <ToggleLeft className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedItem({id: key.id, type: 'activation'});
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-red-600"
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
        </TabsContent>

        {/* EXTENSION KEYS TAB */}
        <TabsContent value="extension" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="grid grid-cols-3 gap-4 flex-1 mr-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {extensionKeys.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Keys</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {extensionKeys.filter(k => k.is_active && !k.used).length}
                  </div>
                  <div className="text-sm text-gray-600">Available</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {extensionKeys.filter(k => k.used).length}
                  </div>
                  <div className="text-sm text-gray-600">Used</div>
                </CardContent>
              </Card>
            </div>
            
            <Dialog open={generateDialogOpen && activeTab === 'extension'} onOpenChange={setGenerateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Extension Key</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Plan Name (Optional)</Label>
                    <Select
                      value={extensionForm.plan || "all"}
                      onValueChange={(value) => setExtensionForm({...extensionForm, plan: value === "all" ? "" : value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Plans" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Plans</SelectItem>
                        <SelectItem value="Contractor Plus">Contractor Plus</SelectItem>
                        <SelectItem value="Contractor Pro">Contractor Pro</SelectItem>
                        <SelectItem value="Enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Select "All Plans" to allow extension for any plan</p>
                  </div>
                  <div>
                    <Label>Extension Duration (Days)</Label>
                    <Input
                      type="number"
                      value={extensionForm.duration_days}
                      onChange={(e) => setExtensionForm({...extensionForm, duration_days: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Max Uses</Label>
                    <Input
                      type="number"
                      value={extensionForm.max_uses}
                      onChange={(e) => setExtensionForm({...extensionForm, max_uses: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Expiry Date (Optional)</Label>
                    <Input
                      type="date"
                      value={extensionForm.expiry_date}
                      onChange={(e) => setExtensionForm({...extensionForm, expiry_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Notes (Optional)</Label>
                    <Textarea
                      value={extensionForm.notes}
                      onChange={(e) => setExtensionForm({...extensionForm, notes: e.target.value})}
                      placeholder="Add notes..."
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleGenerateExtensionKey} className="bg-purple-600 hover:bg-purple-700">
                    Generate
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Used By</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingExtension ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                        </TableCell>
                      </TableRow>
                    ) : extensionKeys.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          No extension keys found
                        </TableCell>
                      </TableRow>
                    ) : (
                      extensionKeys.map((key) => (
                        <TableRow key={key.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="px-2 py-1 bg-purple-100 rounded font-mono text-xs">
                                {key.key}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyKey(key.key)}
                              >
                                {copiedKey === key.key ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            {key.plan ? (
                              <Badge variant="outline">{key.plan}</Badge>
                            ) : (
                              <span className="text-sm text-gray-400">All Plans</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(key, 'extension')}</TableCell>
                          <TableCell>{key.duration_days} days</TableCell>
                          <TableCell>
                            {key.used_by && key.used_by.length > 0 ? (
                              <div className="text-sm">
                                <div className="font-medium">{key.used_by[0].user_email}</div>
                                <div className="text-xs text-gray-500">
                                  {formatDate(key.used_by[0].applied_at)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">Not used</span>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(key.expiry_date)}</TableCell>
                          <TableCell>{formatDate(key.created_at)}</TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate text-sm text-gray-600">
                              {key.notes || '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggle(key.id, 'extension')}
                              >
                                {key.is_active ? (
                                  <ToggleRight className="h-4 w-4 text-green-600" />
                                ) : (
                                  <ToggleLeft className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedItem({id: key.id, type: 'extension'});
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-red-600"
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
        </TabsContent>

        {/* PROMO CODES TAB */}
        <TabsContent value="promo" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="grid grid-cols-3 gap-4 flex-1 mr-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {promoCodes.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Codes</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {promoCodes.filter(p => p.is_active && !p.is_expired && !p.is_exhausted).length}
                  </div>
                  <div className="text-sm text-gray-600">Active</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {promoCodes.reduce((sum, p) => sum + (p.times_used || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Uses</div>
                </CardContent>
              </Card>
            </div>
            
            <Dialog open={generateDialogOpen && activeTab === 'promo'} onOpenChange={setGenerateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Promo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Promo Code</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Code (Leave empty for auto-generate)</Label>
                    <Input
                      value={promoForm.code}
                      onChange={(e) => setPromoForm({...promoForm, code: e.target.value.toUpperCase()})}
                      placeholder="SAVE20"
                    />
                  </div>
                  <div>
                    <Label>Plan Name (Optional)</Label>
                    <Select
                      value={promoForm.plan || "all"}
                      onValueChange={(value) => setPromoForm({...promoForm, plan: value === "all" ? "" : value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Plans" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Plans</SelectItem>
                        <SelectItem value="Contractor Plus">Contractor Plus</SelectItem>
                        <SelectItem value="Contractor Pro">Contractor Pro</SelectItem>
                        <SelectItem value="Enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Select "All Plans" to allow promo code for any plan</p>
                  </div>
                  <div>
                    <Label>Discount Type</Label>
                    <Select 
                      value={promoForm.discount_type} 
                      onValueChange={(value) => setPromoForm({...promoForm, discount_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Discount Value</Label>
                    <Input
                      type="number"
                      value={promoForm.discount_value}
                      onChange={(e) => setPromoForm({...promoForm, discount_value: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Max Uses (0 for unlimited)</Label>
                    <Input
                      type="number"
                      value={promoForm.max_uses}
                      onChange={(e) => setPromoForm({...promoForm, max_uses: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={promoForm.description}
                      onChange={(e) => setPromoForm({...promoForm, description: e.target.value})}
                      placeholder="20% off first month"
                    />
                  </div>
                  <div>
                    <Label>Expiry Date (Optional)</Label>
                    <Input
                      type="date"
                      value={promoForm.expiry_date}
                      onChange={(e) => setPromoForm({...promoForm, expiry_date: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleGeneratePromoCode} className="bg-green-600 hover:bg-green-700">
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingPromos ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                        </TableCell>
                      </TableRow>
                    ) : promoCodes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          No promo codes found
                        </TableCell>
                      </TableRow>
                    ) : (
                      promoCodes.map((promo) => (
                        <TableRow key={promo.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="px-2 py-1 bg-green-100 rounded font-mono text-sm font-bold">
                                {promo.code}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyKey(promo.code)}
                              >
                                {copiedKey === promo.code ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            {promo.plan ? (
                              <Badge variant="outline">{promo.plan}</Badge>
                            ) : (
                              <span className="text-sm text-gray-400">All Plans</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(promo, 'promo')}</TableCell>
                          <TableCell>
                            {promo.discount_type === 'percentage' ? 
                              `${promo.discount_value}%` : 
                              `₹${promo.discount_value}`
                            }
                          </TableCell>
                          <TableCell>
                            {promo.times_used || 0} / {promo.max_uses === 0 ? '∞' : promo.max_uses}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate text-sm text-gray-600">
                              {promo.description || '-'}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(promo.expiry_date)}</TableCell>
                          <TableCell>{formatDate(promo.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggle(promo.id, 'promo')}
                              >
                                {promo.is_active ? (
                                  <ToggleRight className="h-4 w-4 text-green-600" />
                                ) : (
                                  <ToggleLeft className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedItem({id: promo.id, type: 'promo'});
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-red-600"
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
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

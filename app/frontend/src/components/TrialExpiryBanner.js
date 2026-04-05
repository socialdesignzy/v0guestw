import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, X, CreditCard, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { api } from '../utils/api';
import { toast } from 'sonner';

export function TrialExpiryBanner() {
  const [trialStatus, setTrialStatus] = useState(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkTrialStatus();
  }, []);

  const checkTrialStatus = async () => {
    try {
      setLoading(true);
      const response = await api.getTrialStatus();
      
      if (response.data.show_payment_prompt) {
        setTrialStatus(response.data);
        setVisible(true);
      }
    } catch (error) {
      console.error('Failed to check trial status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = () => {
    // Navigate to pricing page with trial conversion flag
    navigate('/pricing?trial_conversion=true');
  };

  const handleDismiss = async () => {
    try {
      await api.dismissTrialPrompt();
      setVisible(false);
      toast.success('Reminder dismissed. We\'ll remind you again tomorrow.');
    } catch (error) {
      console.error('Failed to dismiss prompt:', error);
      toast.error('Failed to dismiss reminder');
    }
  };

  if (loading || !visible || !trialStatus) return null;

  const daysText = trialStatus.days_remaining === 1 ? 'day' : 'days';
  const urgencyColor = trialStatus.days_remaining === 0 
    ? 'from-red-600 to-red-700' 
    : trialStatus.days_remaining === 1 
    ? 'from-orange-500 to-red-500' 
    : 'from-orange-400 to-orange-500';

  return (
    <div className={`bg-gradient-to-r ${urgencyColor} text-white shadow-lg sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-lg">
                  {trialStatus.days_remaining === 0 
                    ? 'Your trial ends today!' 
                    : `Your trial ends in ${trialStatus.days_remaining} ${daysText}!`}
                </p>
                <Clock className="h-5 w-5" />
              </div>
              <p className="text-sm text-white/90">
                Add a payment method now for seamless renewal to Contractor Plus (₹799/month). 
                No charge until trial ends.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              onClick={handleAddPayment}
              className="bg-white text-orange-600 hover:bg-orange-50 font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              Remind Later
            </Button>
            <button
              onClick={handleDismiss}
              className="text-white hover:text-white/80 transition-colors p-1"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { XCircle, AlertTriangle, RefreshCw, ArrowLeft, CreditCard, HelpCircle } from 'lucide-react';

export default function PaymentFailed() {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(10);
  
  const { planName, errorMessage, orderId } = location.state || {};

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/pricing');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleRetryPayment = () => {
    navigate('/pricing', { 
      state: { 
        retryPlan: planName,
        showRetryMessage: true 
      } 
    });
  };

  const handleGoBack = () => {
    navigate('/pricing');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Animated Error Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Pulsing background glow */}
            <div className="absolute inset-0 bg-red-400 blur-3xl opacity-40 animate-pulse"></div>
            {/* Rotating ring */}
            <div className="absolute inset-0 border-4 border-red-300 rounded-full" style={{ animation: 'spin 3s linear infinite' }}></div>
            {/* Main icon */}
            <div className="relative bg-gradient-to-br from-red-500 to-orange-600 rounded-full p-6 shadow-2xl transform hover:scale-110 transition-transform duration-300">
              <XCircle className="h-16 w-16 text-white" strokeWidth={2} />
            </div>
          </div>
        </div>

        <Card className="border-2 border-red-200 shadow-2xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-2 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500"></div>
          
          <CardContent className="p-8 md:p-12">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4 animate-fade-in">
                Payment Failed
              </h1>
              <p className="text-xl text-gray-700 mb-2">
                We couldn't process your payment
              </p>
              <p className="text-gray-600">
                Don't worry, your subscription hasn't been charged
              </p>
            </div>

            {/* Error Details Card */}
            <div className="bg-gradient-to-r from-red-100 to-orange-100 rounded-xl p-6 mb-8 border-2 border-red-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                    <AlertTriangle className="h-6 w-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-red-800 mb-2">
                    What happened?
                  </h2>
                  <p className="text-gray-700 mb-3">
                    {errorMessage || 'Your payment could not be processed. This could be due to insufficient funds, incorrect card details, or network issues.'}
                  </p>
                  {planName && (
                    <div className="mt-3 pt-3 border-t border-red-300">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Plan:</span> {planName}
                      </p>
                    </div>
                  )}
                  {orderId && (
                    <p className="text-xs text-gray-500 mt-2 font-mono">
                      Order ID: {orderId}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Common Reasons */}
            <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-gray-600" />
                Common reasons for payment failure:
              </h3>
              <ul className="space-y-3">
                {[
                  'Insufficient funds in your account',
                  'Incorrect card details or expired card',
                  'Network connectivity issues',
                  'Bank security restrictions',
                  'Daily transaction limit exceeded'
                ].map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></div>
                    <span className="text-sm">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={handleRetryPayment}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-lg py-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Try Payment Again
              </Button>
              
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 text-lg py-6"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Pricing Plans
              </Button>
            </div>

            {/* Support Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                      <HelpCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Need Help?
                    </h4>
                    <p className="text-sm text-blue-800 mb-4">
                      If you continue to experience payment issues, please contact our support team. We're here to help!
                    </p>
                    <Button
                      onClick={() => navigate('/contact')}
                      variant="outline"
                      className="border-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      Contact Support
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Auto Redirect Message */}
            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm">
                Redirecting to pricing page in{' '}
                <span className="font-bold text-red-600 text-lg">{countdown}</span>{' '}
                seconds...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

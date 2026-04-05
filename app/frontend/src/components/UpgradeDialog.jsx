import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Crown, 
  ArrowRight, 
  Zap, 
  TrendingUp, 
  Users, 
  Building2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function UpgradeDialog({ open, onOpenChange, currentPlan, resourceType, currentLimit, suggestedPlan }) {
  const navigate = useNavigate();

  // Determine suggested plan based on current plan
  const getSuggestedPlan = () => {
    if (suggestedPlan) return suggestedPlan;
    
    const planName = (currentPlan || "").toLowerCase();
    if (planName.includes("plus")) {
      return "Contractor Pro";
    } else if (planName.includes("pro")) {
      return "Enterprise";
    }
    return "Contractor Pro"; // Default
  };

  const finalSuggestedPlan = getSuggestedPlan();

  const getPlanBenefits = () => {
    if (finalSuggestedPlan === "Contractor Pro") {
      return {
        name: "Contractor Pro",
        workers: 250,
        employers: 100,
        price: 999,
        features: [
          "Up to 250 workers",
          "Up to 100 employers",
          "Priority support",
          "Advanced reporting",
          "All Contractor Plus features"
        ],
        isPro: true
      };
    } else if (suggestedPlan === "Enterprise") {
      return {
        name: "Enterprise",
        workers: "Unlimited",
        employers: "Unlimited",
        price: 1999,
        features: [
          "Unlimited workers",
          "Unlimited employers",
          "24/7 Priority support",
          "Custom integrations",
          "Dedicated account manager"
        ],
        isEnterprise: true
      };
    }
    return {
      name: finalSuggestedPlan,
      workers: "More",
      employers: "More",
      price: 999,
      features: ["Higher limits", "All premium features"]
    };
  };

  const plan = getPlanBenefits();
  const resourceText = resourceType === "worker" ? "workers" : "employers";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 border-2 border-slate-200 shadow-2xl">
        {/* Clean Header */}
        <div className="bg-white border-b border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-md">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Upgrade Required
              </DialogTitle>
              <p className="text-sm text-slate-600 mt-1">
                You've reached your <span className="font-semibold">{currentPlan}</span> plan limit
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Current vs Upgrade Comparison */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Current Plan */}
              <div className="bg-white rounded-xl p-6 border-2 border-slate-200 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{currentPlan}</h3>
                    <p className="text-sm text-slate-500">Current Plan</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-slate-400" />
                    <span>Limited to {currentLimit} {resourceText}</span>
                  </div>
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500">Upgrade to unlock more!</p>
                  </div>
                </div>
              </div>

              {/* Suggested Upgrade */}
              <div className={`${
                plan.isPro 
                  ? 'bg-gradient-to-br from-white via-amber-50 to-yellow-50' 
                  : plan.isEnterprise
                    ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600'
              } rounded-xl p-6 border-2 ${
                plan.isPro 
                  ? 'border-amber-400 shadow-lg' 
                  : plan.isEnterprise
                    ? 'border-gray-600'
                    : 'border-indigo-400'
              } relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <Badge className={`${
                  plan.isPro 
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-2 border-amber-600 shadow-md' 
                    : plan.isEnterprise
                      ? 'bg-white/20 text-gray-200 border-gray-400'
                      : 'bg-white/20 text-white border-white/30'
                } mb-3 relative z-10 font-bold`}>
                  <Zap className="h-3 w-3 mr-1" />
                  Recommended
                </Badge>
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 shadow-md ${
                    plan.isPro 
                      ? 'bg-gradient-to-br from-amber-100 to-yellow-100 border-amber-400' 
                      : plan.isEnterprise
                        ? 'bg-white/20 border-gray-400'
                        : 'bg-white/20 border-white/30'
                  }`}>
                    {plan.isPro ? (
                      <Crown className="h-5 w-5 fill-amber-600 text-amber-600" />
                    ) : (
                      <Crown className={`h-5 w-5 ${
                        plan.isEnterprise ? 'text-gray-200' : 'text-white'
                      }`} />
                    )}
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${
                      plan.isPro 
                        ? 'text-gray-900' 
                        : plan.isEnterprise
                          ? 'text-gray-200'
                          : 'text-white'
                    }`}>
                      {plan.isPro ? (
                        <span className="text-gray-900 font-black">
                          {plan.name}
                        </span>
                      ) : (
                        plan.name
                      )}
                    </h3>
                    <p className={`text-sm font-medium ${
                      plan.isPro 
                        ? 'text-gray-600' 
                        : plan.isEnterprise
                          ? 'text-gray-300'
                          : 'text-white/80'
                    }`}>
                      Premium Plan
                    </p>
                  </div>
                </div>
                <div className="space-y-2 relative z-10">
                  <div className={`flex items-center gap-2 text-sm ${
                    plan.isPro 
                      ? 'text-gray-700 font-medium' 
                      : plan.isEnterprise
                        ? 'text-gray-200'
                        : 'text-white'
                  }`}>
                    <CheckCircle2 className={`h-4 w-4 ${
                      plan.isPro 
                        ? 'text-green-600' 
                        : plan.isEnterprise
                          ? 'text-gray-200'
                          : 'text-white'
                    }`} />
                    <span className="font-medium">Up to {plan.workers} workers</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${
                    plan.isPro 
                      ? 'text-gray-700 font-medium' 
                      : plan.isEnterprise
                        ? 'text-gray-200'
                        : 'text-white'
                  }`}>
                    <CheckCircle2 className={`h-4 w-4 ${
                      plan.isPro 
                        ? 'text-green-600' 
                        : plan.isEnterprise
                          ? 'text-gray-200'
                          : 'text-white'
                    }`} />
                    <span className="font-medium">Up to {plan.employers} employers</span>
                  </div>
                  <div className={`pt-4 border-t ${
                    plan.isPro 
                      ? 'border-amber-200' 
                      : plan.isEnterprise
                        ? 'border-gray-600'
                        : 'border-white/20'
                  } mt-4`}>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-black ${
                        plan.isPro 
                          ? 'text-gray-900' 
                          : plan.isEnterprise
                            ? 'text-gray-200'
                            : 'text-white'
                      }`}>
                        ₹{plan.price}
                      </span>
                      <span className={`text-sm font-medium ${
                        plan.isPro 
                          ? 'text-gray-600' 
                          : plan.isEnterprise
                            ? 'text-gray-300'
                            : 'text-white/80'
                      }`}>
                        /month
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits List */}
            <div className="bg-white rounded-xl p-6 border-2 border-slate-200 shadow-md mb-6">
              <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                What You'll Get
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => {
                  onOpenChange(false);
                  navigate('/pricing');
                }}
                className={`flex-1 h-12 text-base font-bold ${
                  plan.isPro 
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md hover:shadow-lg transition-all duration-300' 
                    : plan.isEnterprise
                      ? 'bg-gradient-to-r from-gray-900 via-black to-gray-800 hover:from-black hover:to-gray-900 text-gray-200'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                }`}
              >
                <Crown className={`mr-2 h-5 w-5 ${
                  plan.isPro ? 'fill-white text-white' : plan.isEnterprise ? 'text-gray-200' : 'text-white'
                }`} />
                Upgrade to {plan.name}
                <ArrowRight className={`ml-2 h-5 w-5 ${
                  plan.isPro ? 'text-white' : plan.isEnterprise ? 'text-gray-200' : 'text-white'
                }`} />
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="border-2 border-slate-300 hover:bg-slate-50 h-12"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


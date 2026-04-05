import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  BookOpen, Users, Building, Calendar, CheckCircle, 
  DollarSign, TrendingUp, FileText, Home, CreditCard,
  Settings, Shield, BarChart3, Clock, Bed, Plus,
  ArrowLeft, ChevronRight, Sparkles, Zap, Target,
  ListChecks, Wallet, Receipt, PieChart, UserCheck,
  Package, AlertCircle
} from 'lucide-react';

export default function OnlineResources() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location]);

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Sparkles,
      color: 'from-blue-500 to-blue-600',
      description: 'Learn the basics of GuestWorker and set up your account',
      topics: [
        {
          title: 'Creating Your Account',
          icon: UserCheck,
          content: 'Register with your email, name, and phone number. After registration, you will be automatically logged in and redirected to choose a subscription plan. Start with a 14-day free trial to explore all features.'
        },
        {
          title: 'Choosing a Plan',
          icon: Package,
          content: 'Select from Basic, Standard, or Premium plans based on your workforce size. Each plan offers different limits for workers, employers, and bookings. You can upgrade or downgrade anytime from the Manage Subscription page.'
        },
        {
          title: 'Dashboard Overview',
          icon: Home,
          content: 'Your dashboard displays key metrics including total workers, employers, attendance, pending payments, and monthly revenue. Quick action buttons let you add workers, mark attendance, and record payments instantly.'
        },
        {
          title: 'Setting Default Wages',
          icon: Settings,
          content: 'Configure default wages in the Attendance page. Set Default Wage to Workers (what you pay workers) and Default Rate from Employers (what you collect from employers). These defaults auto-fill when marking attendance.'
        }
      ]
    },
    {
      id: 'workers',
      title: 'Managing Workers',
      icon: Users,
      color: 'from-green-500 to-green-600',
      description: 'Add, edit, and organize your workforce efficiently',
      topics: [
        {
          title: 'Adding Workers',
          icon: Plus,
          content: 'Navigate to Workers page and click Add Worker. Enter name, phone number, address, and daily wage. You can also add optional details like room assignment and notes. Workers are immediately available for attendance marking.'
        },
        {
          title: 'Worker Status',
          icon: CheckCircle,
          content: 'Workers can be Active or Inactive. Only active workers appear in attendance and booking forms. Use the status toggle to temporarily disable workers without deleting their records and history.'
        },
        {
          title: 'Editing Worker Details',
          icon: Settings,
          content: 'Click any worker card to edit their information. Update wages, contact details, room assignments, or status. Changes are saved instantly and reflected across all features.'
        },
        {
          title: 'Worker Search and Filter',
          icon: Target,
          content: 'Use the search bar to find workers by name or phone. Filter by status (Active/Inactive) to quickly view specific groups. The worker count updates dynamically based on your filters.'
        },
        {
          title: 'Room Assignment',
          icon: Bed,
          content: 'Assign workers to rooms for accommodation tracking. Create rooms first in the Rooms page, then assign workers during creation or editing. View all workers in a room from the Rooms page.'
        }
      ]
    },
    {
      id: 'employers',
      title: 'Managing Employers',
      icon: Building,
      color: 'from-purple-500 to-purple-600',
      description: 'Track clients and companies you work with',
      topics: [
        {
          title: 'Adding Employers',
          icon: Plus,
          content: 'Go to Employers page and click Add Employer. Enter company name, contact person, phone, email, and address. Employers represent the clients or companies where you send workers.'
        },
        {
          title: 'Employer Status',
          icon: CheckCircle,
          content: 'Employers can be Active or Inactive. Only active employers appear in attendance, booking, and payment forms. Inactive employers retain their historical data but cannot be used for new transactions.'
        },
        {
          title: 'Editing Employer Details',
          icon: Settings,
          content: 'Click any employer card to update their information. Modify contact details, address, or status. All changes are immediately reflected in attendance and booking forms.'
        },
        {
          title: 'Employer Search',
          icon: Target,
          content: 'Search employers by name, contact person, or phone number. Filter by Active/Inactive status to manage your client list efficiently.'
        }
      ]
    },
    {
      id: 'attendance',
      title: 'Attendance Tracking',
      icon: Calendar,
      color: 'from-orange-500 to-orange-600',
      description: 'Mark and manage daily worker attendance',
      topics: [
        {
          title: 'Marking Employer Attendance',
          icon: Building,
          content: 'Select an employer, enter worker count, and optionally select specific workers. Set payment per worker (defaults to your configured employer rate). Add extra charges, extra payments, or remarks as needed. Save to record attendance.'
        },
        {
          title: 'Marking Worker Attendance',
          icon: Users,
          content: 'Toggle attendance for individual workers. Mark as Present, Absent, or Half Day. The system automatically calculates wages based on worker daily rate and attendance type (Half Day = 50% wage).'
        },
        {
          title: 'Selecting Specific Workers',
          icon: UserCheck,
          content: 'When marking employer attendance, click Select Workers to choose specific workers from available pool. Selected workers are automatically marked present and their individual wages are used for calculations.'
        },
        {
          title: 'Payment Calculations',
          icon: DollarSign,
          content: 'Total amount = (Workers × Payment per worker) + Additional charges + (Selected workers × Extra payment). Commission = Total amount - Total worker wages. All calculations are automatic.'
        },
        {
          title: 'Editing Attendance',
          icon: Settings,
          content: 'Click any saved attendance record to edit. Modify worker count, payments, or remarks. Changes update all related calculations automatically. Delete records if needed.'
        },
        {
          title: 'Date Navigation',
          icon: Calendar,
          content: 'Use the date picker to view or mark attendance for any date. Copy previous day attendance with one click. Today date is highlighted for quick access.'
        },
        {
          title: 'Available Workers',
          icon: ListChecks,
          content: 'The system shows available workers (not already assigned to other employers for the selected date). Track total assigned workers vs total active workers in real-time.'
        }
      ]
    },
    {
      id: 'payments',
      title: 'Payment Processing',
      icon: DollarSign,
      color: 'from-indigo-500 to-indigo-600',
      description: 'Handle wages, collections, and financial transactions',
      topics: [
        {
          title: 'Recording Employer Payments',
          icon: Building,
          content: 'Go to Payments page, select Employer Payment tab. Choose employer, date, and enter amount received. Add payment method (Cash, UPI, Bank Transfer, Cheque) and optional reference number. This tracks money collected from employers.'
        },
        {
          title: 'Recording Worker Payments',
          icon: Users,
          content: 'Select Worker Payment tab. Choose worker, date, and amount paid. Select payment method and add notes if needed. This tracks wages paid to workers and updates their pending balance.'
        },
        {
          title: 'Payment History',
          icon: FileText,
          content: 'View all payment transactions with filters for date range, payment type (Employer/Worker), and payment method. Search by employer or worker name. Export payment reports for accounting.'
        },
        {
          title: 'Pending Balances',
          icon: AlertCircle,
          content: 'Dashboard shows pending payments from employers and pending wages to workers. Click to view detailed breakdowns. Helps track outstanding amounts and cash flow.'
        }
      ]
    },
    {
      id: 'reports',
      title: 'Reports and Analytics',
      icon: FileText,
      color: 'from-violet-500 to-violet-600',
      description: 'Generate insights from your business data',
      topics: [
        {
          title: 'Attendance Reports',
          icon: Calendar,
          content: 'Navigate to Attendance Report page. Select date range and filters. View detailed attendance records with worker names, employers, dates, and payment details. Export to Excel or PDF.'
        },
        {
          title: 'Payment Reports',
          icon: DollarSign,
          content: 'Generate reports for employer payments received and worker wages paid. Filter by date, payment method, or specific employer/worker. Track cash flow and payment trends.'
        },
        {
          title: 'Commission Reports',
          icon: TrendingUp,
          content: 'View commission earned over time. Break down by employer, date range, or worker. Analyze profitability and identify revenue opportunities.'
        }
      ]
    },
    {
      id: 'account',
      title: 'Account Settings',
      icon: Settings,
      color: 'from-gray-500 to-gray-600',
      description: 'Manage your profile and preferences',
      topics: [
        {
          title: 'Profile Information',
          icon: UserCheck,
          content: 'Update your name, email, and phone number from the Account page. Changes are saved instantly and reflected across the platform.'
        },
        {
          title: 'Password Management',
          icon: Shield,
          content: 'Change your password from the Account page. Enter current password and new password. Passwords must be at least 6 characters with uppercase, lowercase, and numbers.'
        },
        {
          title: 'Subscription Details',
          icon: Package,
          content: 'View current plan, billing cycle, and plan limits. See remaining workers, employers, and bookings available in your plan. Access quick links to upgrade or manage subscription.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="relative bg-gradient-to-r from-[#3B2ED0] via-[#4F46E5] to-[#6366F1] overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <Button
            variant="ghost"
            onClick={() => navigate('/help')}
            className="text-white hover:bg-white/20 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Help Center
          </Button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 shadow-xl">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
              Online Resources
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Complete guide to all features and functionality in GuestWorker
            </p>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-4 overflow-x-auto">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-[#3B2ED0] hover:text-white transition-all whitespace-nowrap text-sm font-medium"
                >
                  <Icon className="h-4 w-4" />
                  {section.title}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-16">
          {sections.map((section) => {
            const SectionIcon = section.icon;
            return (
              <div key={section.id} id={section.id} className="scroll-mt-24">
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`h-16 w-16 bg-gradient-to-br ${section.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <SectionIcon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">{section.title}</h2>
                      <p className="text-gray-600 text-lg">{section.description}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {section.topics.map((topic, index) => {
                    const TopicIcon = topic.icon;
                    return (
                      <Card key={index} className="border-2 hover:border-[#3B2ED0]/50 hover:shadow-xl transition-all">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-3 text-xl">
                            <div className={`h-10 w-10 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center`}>
                              <TopicIcon className="h-5 w-5 text-white" />
                            </div>
                            {topic.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 leading-relaxed">{topic.content}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Cannot find what you are looking for? Our support team is here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/help?tab=new')}
              className="bg-white text-[#3B2ED0] hover:bg-gray-100 h-12 px-8 text-base font-semibold"
            >
              Contact Support
            </Button>
            <Button
              onClick={() => navigate('/help')}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/20 h-12 px-8 text-base font-semibold"
            >
              Back to Help Center
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

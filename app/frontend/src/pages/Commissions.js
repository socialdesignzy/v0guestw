import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {  
  DollarSign, 
  Users, 
  Building2, 
  Calendar, 
  Download,
  Search,
  TrendingUp,
  Printer
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDateToDDMMYYYY } from '../utils/dateUtils';

import { getApiUrl } from '../utils/apiConfig';
const API = getApiUrl();
axios.defaults.withCredentials = true;

export default function Commissions() {
  const [commissions, setCommissions] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Simplified filter states
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState('');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [employersRes, workersRes] = await Promise.all([
        api.getEmployers(),
        api.getWorkers()
      ]);

      setEmployers(employersRes.data);
      setWorkers(workersRes.data);

      // Fetch commissions for selected month
      const firstDay = new Date(selectedYear, selectedMonth, 1);
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
      
      const startDate = formatDateToDDMMYYYY(firstDay);
      const endDate = formatDateToDDMMYYYY(lastDay);

      const response = await axios.get(`${API}/reports/commissions`, {
        params: { start_date: startDate, end_date: endDate },
        withCredentials: true
      });

      setCommissions(response.data);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching data:', error);
      }
      toast.error('Failed to load commission data');
    } finally {
      setLoading(false);
    }
  };

  const getEmployerName = (employerId) => {
    const employer = employers.find(e => e.id === employerId);
    return employer?.name || 'Unknown Employer';
  };

  const getWorkerName = (workerId) => {
    const worker = workers.find(w => w.id === workerId);
    return worker?.name || 'Unknown Worker';
  };

  // Apply search filter
  const filteredCommissions = commissions.filter(comm => {
    if (searchQuery) {
      const employerName = getEmployerName(comm.employer_id).toLowerCase();
      const workerName = getWorkerName(comm.worker_id).toLowerCase();
      if (!employerName.includes(searchQuery.toLowerCase()) && 
          !workerName.includes(searchQuery.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  // Group commissions by date
  const groupedByDate = filteredCommissions.reduce((acc, comm) => {
    if (!acc[comm.date]) {
      acc[comm.date] = [];
    }
    acc[comm.date].push(comm);
    return acc;
  }, {});

  // Calculate totals
  const totalCommission = filteredCommissions.reduce((sum, comm) => sum + (comm.commission_amount || 0), 0);
  const totalFromEmployers = filteredCommissions.reduce((sum, comm) => sum + (comm.payment_from_employer || 0), 0);
  const totalToWorkers = filteredCommissions.reduce((sum, comm) => sum + (comm.wage_to_worker || 0), 0);

  const handleExportHTML = () => {
    const periodText = `${months[selectedMonth]} ${selectedYear}`;
    const generatedAt = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Commission Report - ${periodText} · GuestWorker</title>
    <style>
        body { font-family: system-ui, -apple-system, 'Segoe UI', Arial, sans-serif; margin: 32px; background: #fafafa; }
        .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 90px; font-weight: bold; color: rgba(79, 70, 229, 0.05); z-index: -1; pointer-events: none; }
        .container { max-width: 960px; margin: 0 auto; background: white; padding: 36px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); position: relative; z-index: 1; }
        .brand { text-align: center; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; margin-bottom: 24px; }
        .brand-name { font-size: 24px; background: linear-gradient(to right, #3B2ED0, #4F46E5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 800; }
        .brand-tag { margin: 4px 0 0 0; font-size: 13px; color: #6b7280; }
        .header { text-align: center; margin-bottom: 28px; }
        .header h1 { margin: 0; color: #1e1b4b; font-size: 22px; font-weight: 700; }
        .header .period { font-size: 16px; color: #3B2ED0; font-weight: 600; margin: 8px 0 4px 0; }
        .header .meta { font-size: 13px; color: #6b7280; }
        .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px; }
        .summary-card { background: linear-gradient(135deg, #3B2ED0 0%, #4F46E5 100%); color: white; padding: 18px; border-radius: 10px; text-align: center; }
        .summary-card h4 { margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.95; }
        .summary-card p { margin: 0; font-size: 22px; font-weight: 700; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px; }
        th { background: linear-gradient(135deg, #3B2ED0 0%, #4F46E5 100%); color: white; padding: 12px 14px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 11px 14px; border-bottom: 1px solid #f3f4f6; }
        tr:hover { background: #faf5ff; }
        .amount { font-weight: 700; color: #059669; }
        .footer { margin-top: 32px; text-align: center; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 18px; font-size: 13px; }
        .footer strong { color: #3B2ED0; }
        @media print { body { margin: 16px; background: white; } .container { box-shadow: none; } .footer { margin-top: 10px; padding-top: 10px; page-break-inside: avoid; } .footer p { margin: 2px 0; } }
    </style>
</head>
<body>
    <div class="watermark">guestworker.in</div>
    <div class="container">
        <div class="brand">
            <div class="brand-name">GuestWorker</div>
            <p class="brand-tag">guestworker.in · Workforce management</p>
        </div>
        <div class="header">
            <h1>Commission Report</h1>
            <p class="period">${periodText}</p>
            <p class="meta">Generated ${generatedAt}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h4>Total Commission</h4>
                <p>₹${totalCommission.toLocaleString()}</p>
            </div>
            <div class="summary-card">
                <h4>From Employers</h4>
                <p>₹${totalFromEmployers.toLocaleString()}</p>
            </div>
            <div class="summary-card">
                <h4>To Workers</h4>
                <p>₹${totalToWorkers.toLocaleString()}</p>
            </div>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Employer</th>
                    <th style="text-align: center;">Workers</th>
                    <th style="text-align: right;">From Employer</th>
                    <th style="text-align: right;">To Workers</th>
                    <th style="text-align: right;">Commission</th>
                </tr>
            </thead>
            <tbody>
                ${(() => {
                  const grouped = filteredCommissions.reduce((acc, comm) => {
                    if (!acc[comm.date]) acc[comm.date] = {};
                    if (!acc[comm.date][comm.employer_id]) {
                      acc[comm.date][comm.employer_id] = {
                        employer_name: getEmployerName(comm.employer_id),
                        workers_count: 0,
                        total_commission: 0,
                        total_from_employer: 0,
                        total_to_workers: 0
                      };
                    }
                    if (comm.worker_id === "SUMMARY" && comm.workers_count) acc[comm.date][comm.employer_id].workers_count += comm.workers_count;
                    else if (comm.worker_id && comm.worker_id !== "SUMMARY") acc[comm.date][comm.employer_id].workers_count += 1;
                    acc[comm.date][comm.employer_id].total_commission += comm.commission_amount || 0;
                    acc[comm.date][comm.employer_id].total_from_employer += comm.payment_from_employer || 0;
                    acc[comm.date][comm.employer_id].total_to_workers += comm.wage_to_worker || 0;
                    return acc;
                  }, {});

                  return Object.entries(grouped)
                    .sort(([dateA], [dateB]) => {
                      const [dA, mA, yA] = dateA.split('-').map(Number);
                      const [dB, mB, yB] = dateB.split('-').map(Number);
                      return new Date(yB, mB - 1, dB) - new Date(yA, mA - 1, dA);
                    })
                    .map(([date, employers]) =>
                      Object.entries(employers)
                        .sort(([, a], [, b]) => b.total_commission - a.total_commission)
                        .map(([, data]) => `
                          <tr>
                              <td>${date}</td>
                              <td>${data.employer_name}</td>
                              <td style="text-align: center;">${data.workers_count}</td>
                              <td class="amount">₹${data.total_from_employer.toLocaleString()}</td>
                              <td class="amount">₹${data.total_to_workers.toLocaleString()}</td>
                              <td class="amount">₹${data.total_commission.toLocaleString()}</td>
                          </tr>
                        `).join('')
                    ).join('');
                })()}
            </tbody>
        </table>
        
        <div class="footer">
            <p><strong>Total Commission:</strong> ₹${totalCommission.toLocaleString()}</p>
            <p><strong>GuestWorker</strong> · guestworker.in · Computer-generated report</p>
        </div>
    </div>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    
    setTimeout(() => {
      if (newWindow) {
        newWindow.print();
      }
    }, 500);
    
    toast.success('Report opened in new tab');
  };

  const escapeCsv = (v) => {
    const s = String(v ?? '');
    return /[,\n"]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const handleExportCSV = () => {
    try {
      const periodText = `${months[selectedMonth]} ${selectedYear}`;
      const lines = [
        'GuestWorker · guestworker.in',
        'Commission Report',
        `Period,${periodText}`,
        `Generated,${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
        '',
        ['Date', 'Worker', 'Employer', 'Payment from Employer (₹)', 'Wage to Worker (₹)', 'Commission (₹)'].map(escapeCsv).join(','),
        ...filteredCommissions.map(comm => [
          comm.date,
          getWorkerName(comm.worker_id),
          getEmployerName(comm.employer_id),
          comm.payment_from_employer || 0,
          comm.wage_to_worker || 0,
          comm.commission_amount || 0
        ].map(escapeCsv).join(',')),
        '',
        ['Summary', '', '', totalFromEmployers, totalToWorkers, totalCommission].map(escapeCsv).join(',')
      ];
      const csv = '\uFEFF' + lines.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `commissions_${months[selectedMonth]}_${selectedYear}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success('Commission report exported');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Commissions
        </h1>
        <p className="text-gray-600">View and track your commission earnings</p>
      </div>

      {/* Filters - Minimal */}
      <Card className="mb-6 border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Month/Year Selectors */}
            <div className="flex gap-3">
              <Select value={selectedMonth.toString()} onValueChange={(val) => setSelectedMonth(parseInt(val))}>
                <SelectTrigger className="w-40 border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={month} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
                <SelectTrigger className="w-32 border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by employer or worker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300"
              />
            </div>

            {/* Export Buttons */}
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                onClick={handleExportHTML}
                className="border-gray-300"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="border-gray-300"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards - Minimal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Commission</p>
                <p className="text-3xl font-bold text-emerald-600">₹{totalCommission.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">From Employers</p>
                <p className="text-3xl font-bold text-blue-600">₹{totalFromEmployers.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">To Workers</p>
                <p className="text-3xl font-bold text-purple-600">₹{totalToWorkers.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission List */}
      {loading ? (
        <Card className="border border-gray-200">
          <CardContent className="p-12 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading commission data...</p>
          </CardContent>
        </Card>
      ) : filteredCommissions.length === 0 ? (
        <Card className="border border-gray-200">
          <CardContent className="p-12 text-center">
            <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Commissions Found</h3>
            <p className="text-gray-600">No commission data available for the selected period.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByDate)
            .sort(([dateA], [dateB]) => {
              const [dA, mA, yA] = dateA.split('-').map(Number);
              const [dB, mB, yB] = dateB.split('-').map(Number);
              return new Date(yB, mB - 1, dB) - new Date(yA, mA - 1, dA);
            })
            .map(([date, dayCommissions]) => {
              const dayTotal = dayCommissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0);
              
              // Group by employer for this day
              const employerGroups = dayCommissions.reduce((acc, comm) => {
                if (!acc[comm.employer_id]) {
                  acc[comm.employer_id] = {
                    employer_name: getEmployerName(comm.employer_id),
                    workers_count: 0,
                    total_commission: 0,
                    total_from_employer: 0,
                    total_to_workers: 0
                  };
                }
                if (comm.worker_id === "SUMMARY" && comm.workers_count) {
                  acc[comm.employer_id].workers_count += comm.workers_count;
                } else if (comm.worker_id && comm.worker_id !== "SUMMARY") {
                  acc[comm.employer_id].workers_count += 1;
                }
                acc[comm.employer_id].total_commission += comm.commission_amount || 0;
                acc[comm.employer_id].total_from_employer += comm.payment_from_employer || 0;
                acc[comm.employer_id].total_to_workers += comm.wage_to_worker || 0;
                return acc;
              }, {});

              const totalWorkers = dayCommissions.reduce((sum, comm) => {
                if (comm.worker_id === "SUMMARY" && comm.workers_count) {
                  return sum + comm.workers_count;
                } else if (comm.worker_id && comm.worker_id !== "SUMMARY") {
                  return sum + 1;
                }
                return sum;
              }, 0);

              return (
                <Card key={date} className="border border-gray-200 shadow-sm">
                  <CardHeader className="bg-gray-50 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-gray-900">{date}</CardTitle>
                          <p className="text-sm text-gray-600">
                            {totalWorkers} worker{totalWorkers !== 1 ? 's' : ''} • {Object.keys(employerGroups).length} employer{Object.keys(employerGroups).length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Daily Total</p>
                        <p className="text-2xl font-bold text-emerald-600">₹{dayTotal.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Employer</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Workers</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">From Employer</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">To Workers</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Commission</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(employerGroups)
                            .sort(([, a], [, b]) => b.total_commission - a.total_commission)
                            .map(([employerId, data]) => (
                              <tr key={employerId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                  {data.employer_name}
                                </td>
                                <td className="py-3 px-4 text-sm text-center">
                                  <Badge variant="outline" className="bg-gray-50">
                                    {data.workers_count}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-sm text-right font-medium text-gray-700">
                                  ₹{data.total_from_employer.toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-sm text-right font-medium text-gray-700">
                                  ₹{data.total_to_workers.toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-sm text-right">
                                  <span className="font-bold text-emerald-600">
                                    ₹{data.total_commission.toLocaleString()}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
}

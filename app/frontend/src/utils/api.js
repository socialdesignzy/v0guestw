import axios from 'axios';

// Backend API configuration
// Production: https://api.guestworker.app
// Development: http://localhost:8000
const BACKEND_HOST = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://api.guestworker.app' 
    : `http://${window.location.hostname}:8000`);
const API = `${BACKEND_HOST}/api`;
const API_URL = BACKEND_HOST;

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ All your API routes now use axiosInstance
export const api = {
  // ------------------ Dashboard ------------------
  getDashboardStats: (params) => axiosInstance.get(`/dashboard/stats`, { params }),
  getActivities: (params) => axiosInstance.get(`/dashboard/activities`, { params }),

  // ------------------ Workers ------------------
  getWorkers: () => axiosInstance.get(`/workers`),
  getWorker: (id) => axiosInstance.get(`/workers/${id}`),
  createWorker: (data) => axiosInstance.post(`/workers`, data),
  updateWorker: (id, data) => axiosInstance.put(`/workers/${id}`, data),
  deleteWorker: (id) => axiosInstance.delete(`/workers/${id}`),

  // ------------------ Employers ------------------
  getEmployers: () => axiosInstance.get(`/employers`),
  getEmployer: (id) => axiosInstance.get(`/employers/${id}`),
  createEmployer: (data) => axiosInstance.post(`/employers`, data),
  updateEmployer: (id, data) => axiosInstance.put(`/employers/${id}`, data),
  deleteEmployer: (id) => axiosInstance.delete(`/employers/${id}`),

  // ------------------ Attendance ------------------
  createEmployerAttendance: (data) => axiosInstance.post(`/attendance/employer`, data),
  getEmployerAttendance: (params) => axiosInstance.get(`/attendance/employer`, { params }),
  createWorkerAttendance: (data) => axiosInstance.post(`/attendance/worker`, data),
  getWorkerAttendance: (params) => axiosInstance.get(`/attendance/worker`, { params }),

  // ------------------ Bookings ------------------
  createBooking: (data) => axiosInstance.post(`/bookings`, data),
  getBookings: (params) => axiosInstance.get(`/bookings`, { params }),
  updateBooking: (id, data) => axiosInstance.put(`/bookings/${id}`, data),
  deleteBooking: (id) => axiosInstance.delete(`/bookings/${id}`),
  getBookingAvailability: (date) => axiosInstance.get(`/bookings/availability`, { params: { date } }),
  
  // ------------------ Preferences ------------------
  getPreferences: () => axiosInstance.get(`/preferences`),
  updatePreferences: (data) => axiosInstance.put(`/preferences`, data),

  // ✅ New route to fetch available workers for date
  getAvailableWorkers: (date) =>
    axiosInstance.get(`/attendance/available-workers`, { params: { date } }),

  // ------------------ Payments ------------------
  collectPayment: (data) => axiosInstance.post(`/payments/collect`, data),
  getPaymentCollections: () => axiosInstance.get(`/payments/collections`),
  reversePaymentCollection: (paymentId) => axiosInstance.delete(`/payments/collection/${paymentId}`),
  settleWage: (data) => axiosInstance.post(`/payments/settle-wage`, data),
  getWageSettlements: () => axiosInstance.get(`/payments/settlements`),
  reverseWageSettlement: (settlementId) => axiosInstance.delete(`/payments/settlement/${settlementId}`),

  // ------------------ Payment Summaries ------------------
  getEmployerSummaries: (search, filterStatus, startDate, endDate) =>
    axiosInstance.get(`/payments/employer-summaries`, {
      params: { 
        search, 
        filter_status: filterStatus,
        start_date: startDate,
        end_date: endDate
      },
    }),
  getEmployerHistory: (employerId, startDate, endDate) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return axiosInstance.get(`/payments/employer-history/${employerId}`, { params });
  },
  getWorkerSummaries: (search, filterStatus, startDate, endDate) =>
    axiosInstance.get(`/payments/worker-summaries`, {
      params: { 
        search, 
        filter_status: filterStatus,
        start_date: startDate,
        end_date: endDate
      },
    }),
  getWorkerHistory: (workerId, startDate, endDate) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return axiosInstance.get(`/payments/worker-history/${workerId}`, { params });
  },
  exportEmployerHistory: (employerId) =>
    `${API_URL}/api/payments/export-employer-history/${employerId}`,
  exportWorkerHistory: (workerId) =>
    `${API_URL}/api/payments/export-worker-history/${workerId}`,
  
  // Invoice generation
  generateEmployerInvoice: (employerId, startDate, endDate) => {
    let url = `${API_URL}/api/employers/${employerId}/work-history/invoice`;
    if (startDate && endDate) {
      url += `?start_date=${startDate}&end_date=${endDate}`;
    }
    return url;
  },
  generateWorkerInvoice: (workerId, startDate, endDate) => {
    let url = `${API_URL}/api/workers/${workerId}/work-history/invoice`;
    if (startDate && endDate) {
      url += `?start_date=${startDate}&end_date=${endDate}`;
    }
    return url;
  },

  // ------------------ Work History ------------------
  getEmployerWorkHistory: (employerId, startDate, endDate) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return axiosInstance.get(`/employers/${employerId}/work-history`, { params });
  },
  getWorkerWorkHistory: (workerId, startDate, endDate) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return axiosInstance.get(`/workers/${workerId}/work-history`, { params });
  },

  // ------------------ Advances ------------------
  createAdvance: (data) => axiosInstance.post(`/advances`, data),
  getAdvances: () => axiosInstance.get(`/advances`),
  deleteAdvance: (advanceId) => axiosInstance.delete(`/advances/${advanceId}`),
  
  // ------------------ Employer Advances ------------------
  createEmployerAdvance: (data) => axiosInstance.post(`/employer-advances`, data),
  getEmployerAdvances: () => axiosInstance.get(`/employer-advances`),
  deleteEmployerAdvance: (advanceId) => axiosInstance.delete(`/employer-advances/${advanceId}`),

  // ------------------ Extra Charges ------------------
  createExtraCharge: (data) => axiosInstance.post(`/extra-charges`, data),
  getExtraCharges: () => axiosInstance.get(`/extra-charges`),
  deleteExtraCharge: (id) => axiosInstance.delete(`/extra-charges/${id}`),
  splitExtraChargeByRoom: (data) => axiosInstance.post(`/extra-charges/split-by-room`, data),

  // ------------------ Rooms ------------------
  getRooms: () => axiosInstance.get(`/rooms`),
  getRoom: (id) => axiosInstance.get(`/rooms/${id}`),
  createRoom: (data) => axiosInstance.post(`/rooms`, data),
  updateRoom: (id, data) => axiosInstance.put(`/rooms/${id}`, data),
  deleteRoom: (id) => axiosInstance.delete(`/rooms/${id}`),

  // ------------------ Worker Settlement Details ------------------
  getWorkerSettlementDetails: (workerId, startDate, endDate) =>
    axiosInstance.get(`/payments/worker-settlement-details/${workerId}`, {
      params: { start_date: startDate, end_date: endDate },
    }),

  // ------------------ Account ------------------
  updateProfile: (data) => axiosInstance.put(`/account/profile`, data),
  changePassword: (data) => axiosInstance.post(`/account/change-password`, data),
  requestAccountDeletion: (reason) =>
    axiosInstance.post(`/account/request-deletion`, { reason }),

  // ------------------ Reports ------------------
  getReportsSummary: (startDate, endDate) =>
    axiosInstance.get(`/reports/summary`, {
      params: { start_date: startDate, end_date: endDate },
    }),
  getWorkersDetailedReport: (startDate, endDate, status) =>
    axiosInstance.get(`/reports/workers-detailed`, {
      params: { start_date: startDate, end_date: endDate, status },
    }),
  getEmployersDetailedReport: (startDate, endDate, status) =>
    axiosInstance.get(`/reports/employers-detailed`, {
      params: { start_date: startDate, end_date: endDate, status },
    }),
  getAttendanceDetailedReport: (startDate, endDate) =>
    axiosInstance.get(`/reports/attendance-detailed`, {
      params: { start_date: startDate, end_date: endDate },
    }),
  getFinancialDetailedReport: (startDate, endDate) =>
    axiosInstance.get(`/reports/financial-detailed`, {
      params: { start_date: startDate, end_date: endDate },
    }),

  getAttendanceReport: (startDate, endDate) =>
    axiosInstance.get(`/reports/attendance`, {
      params: { start_date: startDate, end_date: endDate },
    }),
  getPaymentsReport: (startDate, endDate) =>
    axiosInstance.get(`/reports/payments`, {
      params: { start_date: startDate, end_date: endDate },
    }),
  getWagesReport: (startDate, endDate) =>
    axiosInstance.get(`/reports/wages`, {
      params: { start_date: startDate, end_date: endDate },
    }),
  getUserActivityReport: (startDate, endDate) =>
    axiosInstance.get(`/reports/user-activity`, {
      params: { start_date: startDate, end_date: endDate },
    }),
  getAdvancesReport: (startDate, endDate) =>
    axiosInstance.get(`/reports/advances`, {
      params: { start_date: startDate, end_date: endDate },
    }),
  getCommissionsReport: (startDate, endDate) =>
    axiosInstance.get(`/reports/commissions`, {
      params: { start_date: startDate, end_date: endDate },
    }),

  exportAllReports: (startDate, endDate) =>
    `${API_URL}/reports/export-all?start_date=${startDate || ""}&end_date=${endDate || ""}`,
  exportAttendanceReport: (startDate, endDate) =>
    `${API_URL}/reports/export-attendance?start_date=${startDate || ""}&end_date=${endDate || ""}`,
  exportPaymentsReport: (startDate, endDate) =>
    `${API_URL}/reports/export-payments?start_date=${startDate || ""}&end_date=${endDate || ""}`,
  exportWagesReport: (startDate, endDate) =>
    `${API_URL}/reports/export-wages?start_date=${startDate || ""}&end_date=${endDate || ""}`,
  exportAdvancesReport: (startDate, endDate) =>
    `${API_URL}/reports/export-advances?start_date=${startDate || ""}&end_date=${endDate || ""}`,
  exportCommissionsReport: (startDate, endDate) =>
    `${API_URL}/reports/export-commissions?start_date=${startDate || ""}&end_date=${endDate || ""}`,
  exportWorkers: () => `${API_URL}/reports/export-workers`,
  exportEmployers: () => `${API_URL}/reports/export-employers`,

  // ------------------ New Complete Report Endpoints ------------------
  getWorkersCompleteReport: (startDate, endDate) =>
    axiosInstance.get(`/reports/workers-complete`, {
      params: { start_date: startDate, end_date: endDate },
    }),
  getEmployersCompleteReport: (startDate, endDate) =>
    axiosInstance.get(`/reports/employers-complete`, {
      params: { start_date: startDate, end_date: endDate },
    }),
  getAttendanceCompleteReport: (startDate, endDate) =>
    axiosInstance.get(`/reports/attendance-complete`, {
      params: { start_date: startDate, end_date: endDate },
    }),
  getCommissionsCompleteReport: (startDate, endDate) =>
    axiosInstance.get(`/reports/commissions-complete`, {
      params: { start_date: startDate, end_date: endDate },
    }),
  getAdvancesCompleteReport: (startDate, endDate) =>
    axiosInstance.get(`/reports/advances-complete`, {
      params: { start_date: startDate, end_date: endDate },
    }),
  getBusinessOverviewCompleteReport: (startDate, endDate) =>
    axiosInstance.get(`/reports/business-overview-complete`, {
      params: { start_date: startDate, end_date: endDate },
    }),

  // ------------------ Razorpay Integration (User-facing) ------------------
  checkGatewayStatus: () => axiosInstance.get(`/gateway/status`),
  getPublicKey: () => axiosInstance.get(`/gateway/public-key`),
  createPaymentOrder: (orderData) => axiosInstance.post(`/payment/create-order`, orderData),
  verifyPayment: (paymentData) => axiosInstance.post(`/payment/verify`, paymentData),
  createSubscription: (body) => axiosInstance.post(`/payment/create-subscription`, body),
  verifySubscriptionPayment: (data) => axiosInstance.post(`/payment/verify-subscription`, data),
  
  // Subscription invoice generation
  generateSubscriptionInvoice: (transactionId) => {
    return `${API_URL}/api/subscription/invoice/${transactionId}`;
  },

  // ------------------ User Messages (Help Center) ------------------
  sendMessage: (messageData) => axiosInstance.post(`/messages/send`, messageData),
  getUserMessages: () => axiosInstance.get(`/messages/my-messages`),
  replyToMessage: (messageId, reply) => axiosInstance.post(`/messages/${messageId}/reply`, { reply }),
  markMessageOpened: (messageId) => axiosInstance.put(`/messages/${messageId}/mark-opened`),
  getUserUnreadCount: () => axiosInstance.get(`/messages/unread-count`),

  // ------------------ Notifications ------------------
  getNotifications: (limit = 20) => axiosInstance.get(`/notifications`, { params: { limit } }),
  markNotificationRead: (id) => axiosInstance.post(`/notifications/read`, null, { params: { notification_id: id } }),
  markAllNotificationsRead: () => axiosInstance.post(`/notifications/read-all`),
  markAttendanceReminderRead: () => axiosInstance.post(`/notifications/mark-attendance-reminder-read`),
  deleteNotification: (id) => axiosInstance.delete(`/notifications/${id}`),

  // ------------------ Promotions/Offers ------------------
  getMyPromotions: () => axiosInstance.get(`/promotions/my-offers`),
  calculatePromotionalPrice: (plan) => axiosInstance.get(`/promotions/calculate-price`, { params: { plan } }),

  // ------------------ Subscription Management ------------------
  getMyTransactions: () => axiosInstance.get(`/subscription/transactions`),
  getSubscriptionLimits: () => axiosInstance.get(`/subscription/limits`),
  applyExtensionKey: (key) => axiosInstance.post(`/subscription/apply-extension-key`, { key }),
  cancelSubscription: () => axiosInstance.post(`/subscription/cancel`),
  restartSubscription: () => axiosInstance.post(`/subscription/restart`),
  applyPromoCode: (code) => axiosInstance.post(`/subscription/apply-promo`, { code }),
  activateTrial: (data) => axiosInstance.post(`/subscription/activate-trial`, data || {}),
  changePlan: (planData) => axiosInstance.post(`/subscription/change-plan`, planData),
  
  // Trial to Paid Conversion
  getTrialStatus: () => axiosInstance.get(`/subscription/trial-status`),
  dismissTrialPrompt: () => axiosInstance.post(`/subscription/dismiss-trial-prompt`),
  setupTrialPayment: (planData) => axiosInstance.post(`/subscription/setup-trial-payment`, planData),

  // ------------------ Admin Notifications ------------------
  adminSendNotifications: (data) => axiosInstance.post(`/admin/notifications/send`, data),

  // ------------------ Public Landing Page ------------------
  getLandingStats: () => axios.get(`${API_URL}/api/public/landing-stats`, { withCredentials: false }),

  // ------------------ Site Maintenance ------------------
  getSiteMaintenance: () => axiosInstance.get(`/site-maintenance`),
};

// ✅ Default export for easy import
export default api;

import axios from 'axios';

// Backend API configuration
// Production: https://api.guestworker.app
// Development: http://localhost:8000
const BACKEND_HOST = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://api.guestworker.app' 
    : `http://${window.location.hostname}:8000`);
const API = `${BACKEND_HOST}/api`;

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================
// ADMIN-ONLY API ENDPOINTS
// This file should ONLY be imported by admin components
// Regular users will never download this file
// ============================================================

export const adminApi = {
  // ------------------ Admin Dashboard ------------------
  getDashboardStats: () => axiosInstance.get(`/admin/dashboard/stats`),
  
  // ------------------ Admin User Management ------------------
  getAllUsers: () => axiosInstance.get(`/admin/users`),
  activateUser: (id) => axiosInstance.put(`/admin/users/${id}/activate`),
  deactivateUser: (id) => axiosInstance.put(`/admin/users/${id}/deactivate`),
  
  // ------------------ Admin Messages ------------------
  getAdminMessages: (params) => axiosInstance.get(`/admin/messages`, { params }),
  getMessageDetails: (messageId) => axiosInstance.get(`/admin/messages/${messageId}`),
  replyToMessage: (messageId, reply) => axiosInstance.post(`/admin/messages/${messageId}/reply`, { reply }),
  updateMessageStatus: (messageId, statusData) => axiosInstance.put(`/admin/messages/${messageId}/status`, statusData),
  deleteMessage: (messageId) => axiosInstance.delete(`/admin/messages/${messageId}`),
  markMessageOpenedByAdmin: (messageId) => axiosInstance.put(`/admin/messages/${messageId}/mark-opened`),
  getAdminUnreadCount: () => axiosInstance.get(`/admin/messages/unread-count`),
  getUserProfileForAdmin: (userId) => axiosInstance.get(`/admin/messages/user-profile/${userId}`),
  getMessageStats: () => axiosInstance.get(`/admin/messages/stats/summary`),
  
  // ------------------ Admin Activation Keys ------------------
  getActivationKeys: () => axiosInstance.get(`/admin/activation-keys`),
  generateActivationKey: (keyData) => axiosInstance.post(`/admin/activation-keys/generate`, keyData),
  toggleActivationKey: (keyId) => axiosInstance.put(`/admin/activation-keys/${keyId}/toggle`),
  deleteActivationKey: (keyId) => axiosInstance.delete(`/admin/activation-keys/${keyId}`),
  
  // ------------------ Admin Payment Gateway ------------------
  saveGatewaySettings: (settings) => axiosInstance.post(`/admin/gateway/settings`, settings),
  getGatewaySettings: () => axiosInstance.get(`/admin/gateway/settings`),
  getPaymentOrders: (status) => axiosInstance.get(`/admin/payment-orders`, { params: { status } }),
  
  // ------------------ Admin Auth ------------------
  adminLogin: (credentials) => axiosInstance.post(`/admin/login`, credentials),
  getAdminProfile: () => axiosInstance.get(`/admin/me`),
  adminLogout: () => axiosInstance.post(`/admin/logout`),
  
  // ------------------ Security Logs & Monitoring ------------------
  getSecurityLogs: (params) => axiosInstance.get(`/admin/security-logs`, { params }),
  acknowledgeSecurityLog: (logId) => axiosInstance.put(`/admin/security-logs/${logId}/acknowledge`),
  resolveSecurityLog: (logId, notes) => axiosInstance.put(`/admin/security-logs/${logId}/resolve`, { notes }),
  bulkAcknowledgeSecurityLogs: (logIds) => axiosInstance.post(`/admin/security-logs/bulk-acknowledge`, logIds),
  getSecurityDashboard: () => axiosInstance.get(`/admin/security-logs/dashboard`),
  
  // ------------------ Extension Keys ------------------
  generateExtensionKey: (keyData) => axiosInstance.post(`/admin/extension-keys/generate`, keyData),
  getExtensionKeys: (params) => axiosInstance.get(`/admin/extension-keys`, { params }),
  toggleExtensionKey: (keyId) => axiosInstance.put(`/admin/extension-keys/${keyId}/toggle`),
  deleteExtensionKey: (keyId) => axiosInstance.delete(`/admin/extension-keys/${keyId}`),
  
  // ------------------ Promo Codes ------------------
  generatePromoCode: (promoData) => axiosInstance.post(`/admin/promo-codes/generate`, promoData),
  getPromoCodes: (params) => axiosInstance.get(`/admin/promo-codes`, { params }),
  togglePromoCode: (promoId) => axiosInstance.put(`/admin/promo-codes/${promoId}/toggle`),
  updatePromoCode: (promoId, promoData) => axiosInstance.put(`/admin/promo-codes/${promoId}`, promoData),
  deletePromoCode: (promoId) => axiosInstance.delete(`/admin/promo-codes/${promoId}`),
  
  // ------------------ Deletion Requests ------------------
  getDeletionRequests: (params) => axiosInstance.get(`/admin/deletion-requests`, { params }),
  approveDeletionRequest: (requestId) => axiosInstance.put(`/admin/deletion-requests/${requestId}/approve`),
  rejectDeletionRequest: (requestId) => axiosInstance.put(`/admin/deletion-requests/${requestId}/reject`),
  
  // ------------------ Notifications ------------------
  sendNotifications: (data) => axiosInstance.post(`/admin/notifications/send`, data),
  getSentNotifications: (limit = 50) => axiosInstance.get(`/admin/notifications/sent`, { params: { limit } }),
  deleteBroadcast: (broadcastId) => axiosInstance.delete(`/admin/notifications/${broadcastId}`),

  // ------------------ Promotions/Offers ------------------
  createPromotion: (data) => axiosInstance.post(`/admin/promotions/create`, data),
  getPromotions: (activeOnly = false) => axiosInstance.get(`/admin/promotions/list`, { params: { active_only: activeOnly } }),
  getUsersForPromotion: () => axiosInstance.get(`/admin/promotions/users`),
  updatePromotion: (promotionId, data) => axiosInstance.put(`/admin/promotions/${promotionId}`, data),
  deletePromotion: (promotionId) => axiosInstance.delete(`/admin/promotions/${promotionId}`),

  // ------------------ Trial Settings ------------------
  getTrialSettings: () => axiosInstance.get(`/admin/trial-settings`),
  updateTrialSettings: (duration_days) => axiosInstance.post(`/admin/trial-settings`, { duration_days }),

  // ------------------ Deleted Users ------------------
  getDeletedUsers: (deletionType = null, skip = 0, limit = 100) => axiosInstance.get(`/admin/deleted-users`, { params: { deletion_type: deletionType, skip, limit } }),
  getDeletedUsersStats: () => axiosInstance.get(`/admin/deleted-users/stats`),

  // ------------------ Site-Wide Offers ------------------
  createSiteOffer: (data) => axiosInstance.post(`/admin/site-offers/create`, data),
  getSiteOffers: (activeOnly = false) => axiosInstance.get(`/admin/site-offers/list`, { params: { active_only: activeOnly } }),
  updateSiteOffer: (offerId, data) => axiosInstance.put(`/admin/site-offers/${offerId}`, data),
  deleteSiteOffer: (offerId) => axiosInstance.delete(`/admin/site-offers/${offerId}`),
  
  // ------------------ Subscription Plans ------------------
  createPlan: (planData) => axiosInstance.post(`/admin/plans`, planData),
  getAllPlans: (includeInactive = false) => axiosInstance.get(`/admin/plans`, { params: { include_inactive: includeInactive } }),
  updatePlan: (planId, planData) => axiosInstance.put(`/admin/plans/${planId}`, planData),
  deletePlan: (planId) => axiosInstance.delete(`/admin/plans/${planId}`),
  createRazorpayPlanForPlan: (planId) => axiosInstance.post(`/admin/plans/${planId}/create-razorpay-plan`),
  
  // ------------------ Contact Messages (Unlogged Users) ------------------
  getContactMessages: (params) => axiosInstance.get(`/admin/contact-messages`, { params }),
  updateContactMessageStatus: (contactId, statusData) => axiosInstance.put(`/admin/contact-messages/${contactId}/status`, statusData),
  deleteContactMessage: (contactId) => axiosInstance.delete(`/admin/contact-messages/${contactId}`),
  
  // ------------------ Site Maintenance ------------------
  getSiteMaintenance: () => axiosInstance.get(`/site-maintenance`),
  setSiteMaintenance: (maintenance) => axiosInstance.post(`/admin/site-maintenance`, { maintenance }),
  
  // ------------------ Platform Revenue ------------------
  getPlatformRevenue: (params) => axiosInstance.get(`/admin/platform-revenue`, { params }),
  deletePlatformRevenueRecord: (recordId) => axiosInstance.delete(`/admin/platform-revenue/${recordId}`),
  deleteAllPlatformRevenueRecords: () => axiosInstance.delete(`/admin/platform-revenue`),
};

export default adminApi;


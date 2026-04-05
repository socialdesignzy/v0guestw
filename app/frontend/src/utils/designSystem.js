// This file contains the vibrant design system for all app pages
// Use these consistently across Workers, Employers, Attendance, Payments, Reports, Account

export const designSystem = {
  // Gradients
  gradients: {
    primary: 'from-[#3B2ED0] to-[#4F46E5]',
    blue: 'from-[#3B2ED0] to-[#22D3EE]',
    purple: 'from-[#3B2ED0] to-[#4F46E5]',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-red-500',
  },
  
  // Background gradients
  bgGradients: {
    page: 'from-[#F8FAFF] via-[#F8FAFF] to-[#F8FAFF]',
    blue: 'from-[#F8FAFF] to-[#F0F9FF]',
    purple: 'from-[#F8FAFF] to-[#F5F3FF]',
    green: 'from-green-50 to-emerald-50',
    orange: 'from-orange-50 to-red-50',
  },
  
  // Card styles
  card: {
    base: 'border-2 hover:border-[#3B2ED0]/30 transition-all hover:shadow-2xl',
    rounded: 'rounded-2xl',
  },
  
  // Button styles
  button: {
    primary: 'bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] hover:from-[#2A1FB8] hover:to-[#3D35D4] text-white shadow-lg',
    blue: 'bg-gradient-to-r from-[#3B2ED0] to-[#22D3EE] hover:from-[#2A1FB8] hover:to-[#06B6D4] text-white shadow-md',
    purple: 'bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] hover:from-[#2A1FB8] hover:to-[#3D35D4] text-white shadow-md',
    green: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md',
    orange: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md',
  },
  
  // Icon containers
  iconContainer: {
    primary: 'w-12 h-12 bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] rounded-2xl flex items-center justify-center shadow-lg',
    blue: 'w-12 h-12 bg-gradient-to-br from-[#3B2ED0] to-[#22D3EE] rounded-2xl flex items-center justify-center shadow-lg',
    purple: 'w-12 h-12 bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] rounded-2xl flex items-center justify-center shadow-lg',
    green: 'w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg',
    orange: 'w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg',
  },

  // Empty states – use with EmptyState from @/components/PageStates
  empty: {
    icon: 'bg-[#3B2ED0]/10 text-[#3B2ED0]',
    iconMuted: 'bg-gray-100 text-gray-500',
    iconOrange: 'bg-orange-100 text-orange-600',
  },

  // Loading – use PageLoading from @/components/PageStates for full-page; Skeleton for inline
  loading: {
    pulse: 'animate-pulse',
  },
};

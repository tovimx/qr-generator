/**
 * Toast Notification Utility
 * Branded toast notifications with consistent styling for user feedback
 */

import toast, { ToastOptions, DefaultToastOptions } from 'react-hot-toast'

// Brand colors matching the application theme
const BRAND_COLORS = {
  success: '#10B981', // emerald-500
  error: '#EF4444',   // red-500
  warning: '#F59E0B', // amber-500
  info: '#3B82F6',    // blue-500
  loading: '#6366F1', // indigo-500
} as const

// Default toast configuration
const defaultOptions: DefaultToastOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    borderRadius: '12px',
    background: '#fff',
    color: '#374151', // gray-700
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #E5E7EB', // gray-200
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontSize: '14px',
    maxWidth: '400px',
  },
}

// Success toast with green accent
export const showSuccess = (message: string, options?: ToastOptions) => {
  return toast.success(message, {
    ...defaultOptions,
    iconTheme: {
      primary: BRAND_COLORS.success,
      secondary: '#fff',
    },
    style: {
      ...defaultOptions.style,
      borderLeft: `4px solid ${BRAND_COLORS.success}`,
    },
    ...options,
  })
}

// Error toast with red accent
export const showError = (message: string, options?: ToastOptions) => {
  return toast.error(message, {
    ...defaultOptions,
    duration: 6000, // Errors stay longer
    iconTheme: {
      primary: BRAND_COLORS.error,
      secondary: '#fff',
    },
    style: {
      ...defaultOptions.style,
      borderLeft: `4px solid ${BRAND_COLORS.error}`,
    },
    ...options,
  })
}

// Warning toast with amber accent
export const showWarning = (message: string, options?: ToastOptions) => {
  return toast(message, {
    ...defaultOptions,
    icon: '⚠️',
    style: {
      ...defaultOptions.style,
      borderLeft: `4px solid ${BRAND_COLORS.warning}`,
    },
    ...options,
  })
}

// Info toast with blue accent
export const showInfo = (message: string, options?: ToastOptions) => {
  return toast(message, {
    ...defaultOptions,
    icon: 'ℹ️',
    style: {
      ...defaultOptions.style,
      borderLeft: `4px solid ${BRAND_COLORS.info}`,
    },
    ...options,
  })
}

// Loading toast with indigo accent
export const showLoading = (message: string, options?: ToastOptions) => {
  return toast.loading(message, {
    ...defaultOptions,
    duration: Infinity, // Loading toasts persist until dismissed
    iconTheme: {
      primary: BRAND_COLORS.loading,
      secondary: '#fff',
    },
    style: {
      ...defaultOptions.style,
      borderLeft: `4px solid ${BRAND_COLORS.loading}`,
    },
    ...options,
  })
}

// Promise toast - shows loading, then success/error
export const showPromise = <T>(
  promise: Promise<T>,
  messages: {
    loading: string
    success: string | ((data: T) => string)
    error: string | ((error: unknown) => string)
  },
  options?: ToastOptions
) => {
  return toast.promise(
    promise,
    messages,
    {
      loading: {
        ...defaultOptions,
        iconTheme: {
          primary: BRAND_COLORS.loading,
          secondary: '#fff',
        },
        style: {
          ...defaultOptions.style,
          borderLeft: `4px solid ${BRAND_COLORS.loading}`,
        },
      },
      success: {
        ...defaultOptions,
        iconTheme: {
          primary: BRAND_COLORS.success,
          secondary: '#fff',
        },
        style: {
          ...defaultOptions.style,
          borderLeft: `4px solid ${BRAND_COLORS.success}`,
        },
      },
      error: {
        ...defaultOptions,
        duration: 6000,
        iconTheme: {
          primary: BRAND_COLORS.error,
          secondary: '#fff',
        },
        style: {
          ...defaultOptions.style,
          borderLeft: `4px solid ${BRAND_COLORS.error}`,
        },
      },
      ...options,
    }
  )
}

// Dismiss specific toast
export const dismiss = (toastId?: string) => {
  toast.dismiss(toastId)
}

// Dismiss all toasts
export const dismissAll = () => {
  toast.dismiss()
}

// Custom toast for advanced use cases
export const showCustom = (message: string, options?: ToastOptions) => {
  return toast(message, {
    ...defaultOptions,
    ...options,
  })
}

// Export the main toast object for advanced usage
export { toast }

// Export common patterns as named exports
export const notifications = {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  loading: showLoading,
  promise: showPromise,
  dismiss,
  dismissAll,
  custom: showCustom,
}

// Export default for convenience
export default notifications
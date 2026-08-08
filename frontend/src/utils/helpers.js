/**
 * Helper Functions/Utilities
 * Common utility functions for the application
 */

/**
 * Format currency to Nigerian Naira
 */
export const formatCurrency = (amount) => {
  if (!amount || Number(amount) === 0) return 'Not a static price';
  return `₦${Number(amount).toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

/**
 * Format date to readable format
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date and time
 */
export const formatDateTime = (date) => {
  return new Date(date).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Nigerian format)
 */
export const isValidPhoneNumber = (phoneNumber) => {
  const phoneRegex = /^(\+234|0)[1-9]\d{9}$/;
  return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, length = 100) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

/**
 * Get initials from name
 */
export const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};

/**
 * Get status color
 */
export const getStatusColor = (status) => {
  const colors = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    completed: '#10b981',
    cancelled: '#ef4444',
    active: '#10b981',
    inactive: '#9ca3af',
  };
  return colors[status] || '#6366f1';
};

/**
 * Format time difference (e.g., "2 hours ago")
 */
export const getTimeAgo = (date) => {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDate(date);
};

/**
 * Get Nigerian states
 */
export const getNigerianStates = () => {
  return [
    'Abia',
    'Adamawa',
    'Akwa Ibom',
    'Anambra',
    'Bauchi',
    'Bayelsa',
    'Benue',
    'Borno',
    'Cross River',
    'Delta',
    'Ebonyi',
    'Edo',
    'Ekiti',
    'Enugu',
    'FCT',
    'Gombe',
    'Imo',
    'Jigawa',
    'Kaduna',
    'Kano',
    'Katsina',
    'Kebbi',
    'Kogi',
    'Kwara',
    'Lagos',
    'Nasarawa',
    'Niger',
    'Ogun',
    'Ondo',
    'Osun',
    'Oyo',
    'Plateau',
    'Rivers',
    'Sokoto',
    'Taraba',
    'Yobe',
    'Zamfara',
  ];
};

/**
 * Get service types
 */
export const getServiceTypes = () => {
  return [
    'Event Planner',
    'Event Manager',
    'Venue Owner',
    'Caterer',
    'DJ',
    'Photographer',
    'Videographer',
    'Decorator',
    'Makeup Artist',
    'MC/Compere',
    'Comedian',
    'Live Band',
    'Ushers',
    'Bouncers',
    'Transport',
    'Other',
  ];
};

/**
 * Calculate average rating
 */
export const calculateAverageRating = (ratings) => {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return (sum / ratings.length).toFixed(1);
};

/**
 * Generate random ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Debounce function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Check if user is service provider
 */
export const isServiceProvider = (user) => {
  return user?.role === 'service_provider';
};

/**
 * Check if user is admin
 */
export const isAdmin = (user) => {
  return user?.role === 'admin';
};

/**
 * Calculate discount percentage
 */
export const calculateDiscount = (originalPrice, discountedPrice) => {
  const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
  return Math.round(discount);
};

export default {
  formatCurrency,
  formatDate,
  formatDateTime,
  isValidEmail,
  isValidPhoneNumber,
  truncateText,
  getInitials,
  getStatusColor,
  getTimeAgo,
  getNigerianStates,
  getServiceTypes,
  calculateAverageRating,
  generateId,
  debounce,
  isServiceProvider,
  isAdmin,
  calculateDiscount,
};

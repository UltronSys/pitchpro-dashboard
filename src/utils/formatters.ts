import { format, isValid } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

// Currency formatter for Kenyan Shillings
export const formatCurrency = (amount: number): string => {
  return `Kshs ${amount.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Date formatters
export const formatDate = (date: Date | Timestamp | string | null | undefined, formatString: string = 'MMM dd, yyyy'): string => {
  if (!date) return '';
  
  let dateObj: Date;
  
  if (date instanceof Timestamp) {
    dateObj = date.toDate();
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, formatString);
};

export const formatDateTime = (date: Date | Timestamp | string | null | undefined): string => {
  return formatDate(date, 'MMM dd, yyyy hh:mm a');
};

export const formatTime = (date: Date | Timestamp | string | null | undefined): string => {
  return formatDate(date, 'hh:mm a');
};

// Phone number formatter for Kenyan numbers
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Format as +254 XXX XXX XXX
  if (digits.startsWith('254') && digits.length === 12) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  } else if (digits.startsWith('0') && digits.length === 10) {
    // Convert 0XXX to 254XXX
    const kenyaNumber = '254' + digits.slice(1);
    return `+${kenyaNumber.slice(0, 3)} ${kenyaNumber.slice(3, 6)} ${kenyaNumber.slice(6, 9)} ${kenyaNumber.slice(9)}`;
  }
  
  return phone;
};

// Number formatters
export const formatNumber = (num: number | null | undefined, decimalPlaces: number = 0): string => {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
};

// Percentage formatter
export const formatPercentage = (value: number, decimalPlaces: number = 1): string => {
  return `${(value * 100).toFixed(decimalPlaces)}%`;
};

// Session type formatter
export const formatSessionType = (type: string): string => {
  switch (type) {
    case 'PermanentWeekly':
      return 'Weekly';
    case 'PermanentMonthly':
      return 'Monthly';
    default:
      return type;
  }
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Capitalize first letter
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
// Date utility functions for dashboard

export const startOfCurrentMonth = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

export const endOfCurrentMonth = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
};

export const getCurrentYearStart = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1);
};

export const getCurrentYearEnd = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), 11, 31);
};

export const getCurrentMonthRange = () => ({
  type: 'Monthly' as const,
  startDate: startOfCurrentMonth(),
  endDate: null // null means current date
});

export const getCurrentYearRange = () => ({
  type: 'Yearly' as const,
  startDate: getCurrentYearStart(),
  endDate: getCurrentYearEnd()
});

export const isDateInRange = (date: Date, startDate: Date | null, endDate: Date | null): boolean => {
  const withinStart = !startDate || date >= startDate;
  const withinEnd = !endDate || date <= endDate;
  return withinStart && withinEnd;
};

export const getMonthNames = (): string[] => {
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
};

export const getCurrentMonthName = (): string => {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return monthNames[new Date().getMonth()];
};
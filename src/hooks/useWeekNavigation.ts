import { useState, useCallback, useMemo } from 'react';

export const useWeekNavigation = () => {
  const getStartOfWeek = (date: Date): Date => {
    const newDate = new Date(date);
    const dayOfWeek = newDate.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
    newDate.setDate(newDate.getDate() - diff);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  };

  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(() => {
    const now = new Date();
    return getStartOfWeek(now);
  });

  const changeWeek = useCallback((offsetInWeeks: number) => {
    setSelectedWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (offsetInWeeks * 7));
      return newDate;
    });
  }, []);

  const weekLabel = useMemo(() => {
    const weekEnd = new Date(selectedWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const formatDate = (date: Date, format: string): string => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const day = date.getDate();
      
      if (format === 'MMM d') {
        return `${month} ${day}`;
      }
      return date.toLocaleDateString();
    };
    
    return `${formatDate(selectedWeekStart, 'MMM d')} - ${formatDate(weekEnd, 'MMM d')}`;
  }, [selectedWeekStart]);

  const getWeekEnd = useCallback((): Date => {
    const weekEnd = new Date(selectedWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
  }, [selectedWeekStart]);

  const isCurrentWeek = useMemo(() => {
    const now = new Date();
    const currentWeekStart = getStartOfWeek(now);
    return currentWeekStart.getTime() === selectedWeekStart.getTime();
  }, [selectedWeekStart]);

  const goToToday = useCallback(() => {
    const now = new Date();
    setSelectedWeekStart(getStartOfWeek(now));
  }, []);

  return {
    selectedWeekStart,
    changeWeek,
    weekLabel,
    getWeekEnd,
    isCurrentWeek,
    goToToday
  };
};
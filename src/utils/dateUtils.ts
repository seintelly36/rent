export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
     style: 'decimal', // Use 'decimal' style
    minimumFractionDigits: 2, // Always show two decimal places
    maximumFractionDigits: 2, // Never show more than two
  }).format(amount);
};

export const isOverdue = (dueDate: string): boolean => {
  return new Date(dueDate) < new Date();
};

export const getCurrentMonth = (): string => {
  return new Date().toISOString().slice(0, 7);
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatMinutesToDuration = (minutes: number): string => {
  if (minutes < 0) return '0 minutes';
  
  const MINUTES_IN_HOUR = 60;
  const MINUTES_IN_DAY = 60 * 24;
  const MINUTES_IN_WEEK = 60 * 24 * 7;
  const MINUTES_IN_MONTH = 60 * 24 * 30.44; // Average month
  const MINUTES_IN_YEAR = 60 * 24 * 365.25; // Account for leap years

  if (minutes >= MINUTES_IN_YEAR) {
    const years = Math.floor(minutes / MINUTES_IN_YEAR);
    const remainingMinutes = minutes % MINUTES_IN_YEAR;
    const months = Math.floor(remainingMinutes / MINUTES_IN_MONTH);
    
    if (months > 0) {
      return `${years} year${years !== 1 ? 's' : ''} and ${months} month${months !== 1 ? 's' : ''}`;
    }
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
  
  if (minutes >= MINUTES_IN_MONTH) {
    const months = Math.floor(minutes / MINUTES_IN_MONTH);
    const remainingMinutes = minutes % MINUTES_IN_MONTH;
    const weeks = Math.floor(remainingMinutes / MINUTES_IN_WEEK);
    
    if (weeks > 0) {
      return `${months} month${months !== 1 ? 's' : ''} and ${weeks} week${weeks !== 1 ? 's' : ''}`;
    }
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  
  if (minutes >= MINUTES_IN_WEEK) {
    const weeks = Math.floor(minutes / MINUTES_IN_WEEK);
    const remainingMinutes = minutes % MINUTES_IN_WEEK;
    const days = Math.floor(remainingMinutes / MINUTES_IN_DAY);
    
    if (days > 0) {
      return `${weeks} week${weeks !== 1 ? 's' : ''} and ${days} day${days !== 1 ? 's' : ''}`;
    }
    return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  }
  
  if (minutes >= MINUTES_IN_DAY) {
    const days = Math.floor(minutes / MINUTES_IN_DAY);
    const remainingMinutes = minutes % MINUTES_IN_DAY;
    const hours = Math.floor(remainingMinutes / MINUTES_IN_HOUR);
    
    if (hours > 0) {
      return `${days} day${days !== 1 ? 's' : ''} and ${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
  
  if (minutes >= MINUTES_IN_HOUR) {
    const hours = Math.floor(minutes / MINUTES_IN_HOUR);
    const remainingMinutes = minutes % MINUTES_IN_HOUR;
    
    if (remainingMinutes > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
};

export const convertDurationToMinutes = (value: number, unit: string): number => {
  switch (unit) {
    case 'minutes':
      return value;
    case 'hours':
      return value * 60;
    case 'days':
      return value * 60 * 24;
    case 'weeks':
      return value * 60 * 24 * 7;
    case 'months':
      return Math.round(value * 60 * 24 * 30.44); // Average month
    case 'years':
      return Math.round(value * 60 * 24 * 365.25); // Account for leap years
    default:
      return value;
  }
};

export const convertMinutesToValueAndUnit = (minutes: number): { value: number; unit: string } => {
  const MINUTES_IN_HOUR = 60;
  const MINUTES_IN_DAY = 60 * 24;
  const MINUTES_IN_WEEK = 60 * 24 * 7;
  const MINUTES_IN_MONTH = 60 * 24 * 30.44; // Average month
  const MINUTES_IN_YEAR = 60 * 24 * 365.25; // Account for leap years

  if (minutes >= MINUTES_IN_YEAR && minutes % MINUTES_IN_YEAR === 0) {
    return { value: minutes / MINUTES_IN_YEAR, unit: 'years' };
  }
  
  if (minutes >= MINUTES_IN_MONTH && Math.abs(minutes % MINUTES_IN_MONTH) < 1) {
    return { value: Math.round(minutes / MINUTES_IN_MONTH), unit: 'months' };
  }
  
  if (minutes >= MINUTES_IN_WEEK && minutes % MINUTES_IN_WEEK === 0) {
    return { value: minutes / MINUTES_IN_WEEK, unit: 'weeks' };
  }
  
  if (minutes >= MINUTES_IN_DAY && minutes % MINUTES_IN_DAY === 0) {
    return { value: minutes / MINUTES_IN_DAY, unit: 'days' };
  }
  
  if (minutes >= MINUTES_IN_HOUR && minutes % MINUTES_IN_HOUR === 0) {
    return { value: minutes / MINUTES_IN_HOUR, unit: 'hours' };
  }
  
  return { value: minutes, unit: 'minutes' };
};

export const addDurationToDate = (date: Date, value: number, unit: string): Date => {
  const newDate = new Date(date);
  
  switch (unit) {
    case 'minutes':
      newDate.setMinutes(newDate.getMinutes() + value);
      break;
    case 'hours':
      newDate.setHours(newDate.getHours() + value);
      break;
    case 'days':
      newDate.setDate(newDate.getDate() + value);
      break;
    case 'weeks':
      newDate.setDate(newDate.getDate() + (value * 7));
      break;
    case 'months':
      newDate.setMonth(newDate.getMonth() + value);
      break;
    case 'years':
      newDate.setFullYear(newDate.getFullYear() + value);
      break;
    default:
      break;
  }
  
  return newDate;
};

export const calculateLeaseEndDate = (
  startDateString: string, 
  chargePeriodValue: number, 
  chargePeriodUnit: string, 
  frequency: number
): string => {
  const startDate = new Date(startDateString);
  const totalValue = chargePeriodValue * frequency;
  const endDate = addDurationToDate(startDate, totalValue, chargePeriodUnit);
  return endDate.toISOString(); // Return full ISO timestamp
};

export const generatePaymentIntervals = (
  startDateString: string,
  chargePeriodValue: number,
  chargePeriodUnit: string,
  frequency: number
): { start: string; end: string }[] => {
  const intervals: { start: string; end: string }[] = [];
  let currentDate = new Date(startDateString);
  
  for (let i = 0; i < frequency; i++) {
    const intervalStart = new Date(currentDate);
    const intervalEnd = addDurationToDate(currentDate, chargePeriodValue, chargePeriodUnit);
    
    intervals.push({
      start: intervalStart.toISOString(), // Return full ISO timestamp
      end: intervalEnd.toISOString() // Return full ISO timestamp
    });
    
    currentDate = new Date(intervalEnd);
  }
  
  return intervals;
};
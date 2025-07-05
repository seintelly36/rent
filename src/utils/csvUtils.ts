import { ReportColumn, ReportData } from '../types';

export const exportToCsv = (
  data: ReportData[],
  columns: ReportColumn[],
  filename: string
): void => {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  // Create CSV header
  const headers = columns.map(col => col.header);
  const csvContent = [headers];

  // Create CSV rows
  data.forEach(row => {
    const csvRow = columns.map(col => {
      const value = row[col.key];
      const formattedValue = col.formatter ? col.formatter(value) : value;
      
      // Handle null/undefined values
      if (formattedValue === null || formattedValue === undefined) {
        return '';
      }
      
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      const stringValue = String(formattedValue);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    });
    csvContent.push(csvRow);
  });

  // Convert to CSV string
  const csvString = csvContent.map(row => row.join(',')).join('\n');

  // Create and trigger download
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
   style: 'decimal', // Use 'decimal' style
    minimumFractionDigits: 2, // Always show two decimal places
    maximumFractionDigits: 2, // Never show more than two
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';
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

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

export const calculateDaysPastDue = (dueDate: string): number => {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};
// Date utility functions
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString();
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString();
};

export const isValidDate = (date: string): boolean => {
  return !isNaN(Date.parse(date));
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getDaysBetween = (startDate: string | Date, endDate: string | Date): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
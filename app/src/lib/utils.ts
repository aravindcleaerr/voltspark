import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getCurrentPeriod(type: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL'): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  switch (type) {
    case 'MONTHLY':
      return `${year}-${String(month).padStart(2, '0')}`;
    case 'QUARTERLY':
      const quarter = Math.ceil(month / 3);
      return `${year}-Q${quarter}`;
    case 'ANNUAL':
      return `${year}-${year + 1}`;
  }
}

export function generateCAPANumber(existingCount: number): string {
  const year = new Date().getFullYear();
  const num = String(existingCount + 1).padStart(3, '0');
  return `CAPA-${year}-${num}`;
}

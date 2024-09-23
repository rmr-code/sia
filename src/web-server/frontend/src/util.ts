// src/utils.ts

export function getErrorMessage(error: any): string {
    if (error instanceof Error) {
      return error.message;
    } else if (typeof error === 'string') {
      return error;
    } else {
      try {
        return JSON.stringify(error);
      } catch {
        return 'An unknown error occurred';
      }
    }
  }
  
  // Other utility functions can go here as well
  export function formatDate(date: Date): string {
    return date.toLocaleDateString();
  }
  
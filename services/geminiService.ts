import { JobData, MatchResult } from '../types';

// This function calls the new API that analyzes a SINGLE job.
export const getSingleMatchAnalysis = async (seekerInfo: string, job: JobData): Promise<MatchResult> => {
  // Implement a timeout for the fetch request to prevent it from hanging indefinitely.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ seekerInfo, job }),
      signal: controller.signal, // Pass the AbortController's signal to fetch
    });

    clearTimeout(timeoutId); // Clear the timeout if the request completes in time

    const result = await response.json();

    if (!response.ok) {
      // Use the error message from the API if available, otherwise use a generic one.
      const errorMessage = result.error || `サーバーエラーが発生しました (${response.status})`;
      throw new Error(errorMessage);
    }

    // The API now directly returns the MatchResult object for a single job.
    return result as MatchResult;

  } catch (error) {
    clearTimeout(timeoutId); // Also clear timeout on error
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
          throw new Error(`分析がタイムアウトしました`);
      }
      // Re-throw a more informative error to be caught by the App component
      throw new Error(`${error.message}`);
    }
    throw new Error(`不明なエラーが発生しました。`);
  }
};
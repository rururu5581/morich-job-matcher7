import React from 'react';
import { EnrichedJobData } from '../types';
import { JobCard } from './JobCard';
import { Spinner } from './Spinner';

interface ResultsSectionProps {
  results: EnrichedJobData[];
  isLoading: boolean;
  error: string;
  progressText?: string;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({ results, isLoading, error, progressText }) => {
  const hasError = !!error;
  const hasResults = results.length > 0;

  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <Spinner />
      <p className="mt-4 text-lg font-semibold">{progressText || 'AIがマッチング度を分析中です...'}</p>
      {!progressText && <p>求人数によって時間がかかる場合があります。</p>}
    </div>
  );

  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center h-full text-red-600 bg-red-50 p-6 rounded-lg">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="font-semibold mt-4 text-lg">エラーが発生しました</p>
      <p className="mt-2 text-center text-sm">{error}</p>
    </div>
  );

  const EmptyState = () => (
     <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <p className="mt-4 text-lg font-semibold">マッチング結果がありません</p>
      <p className="mt-1">左のフォームから情報を入力し、「マッチング開始」を押してください。</p>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg min-h-[600px] flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2 flex-shrink-0">マッチング結果</h2>
      
      <div className="flex-grow overflow-y-auto pr-2 -mr-2">
        {isLoading && !hasResults && <LoadingState />}
        
        {hasError && !hasResults && !isLoading && <ErrorState />}

        {hasResults && (
           <div className="space-y-4">
            {hasError && (
              <div className="text-center text-sm text-yellow-800 bg-yellow-100 p-3 rounded-md" role="alert">
                {error}
              </div>
            )}
             {isLoading && progressText && (
              <div className="flex items-center justify-center text-gray-500 py-4">
                <Spinner />
                <p className="ml-3 text-lg font-semibold">{progressText}</p>
              </div>
            )}
            {results.map((job, index) => (
              <JobCard key={`${job['企業 ID'] || job['JOB ID'] || index}`} jobData={job} />
            ))}
          </div>
        )}
        
        {!isLoading && !hasResults && !hasError && <EmptyState />}
      </div>
    </div>
  );
};
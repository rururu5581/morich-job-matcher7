import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { ResultsSection } from './components/ResultsSection';
import { getSingleMatchAnalysis } from './services/geminiService';
import { JobData, EnrichedJobData } from './types';

const App: React.FC = () => {
  const [seekerInfo, setSeekerInfo] = useState<string>('');
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [results, setResults] = useState<EnrichedJobData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [progressText, setProgressText] = useState<string>('');

  const handleMatch = useCallback(async () => {
    if (!seekerInfo || jobs.length === 0) {
      setError('求職者情報と求人CSVの両方を入力してください。');
      return;
    }
    setIsLoading(true);
    setError('');
    setResults([]);
    setProgressText('');

    const successfulMatches: EnrichedJobData[] = [];
    const failedJobSummaries: string[] = [];

    // Process jobs one by one sequentially
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      const jobIdentifier = job['ポジション'] || job['企業名'] || `求人 ${i+1}`;
      setProgressText(`分析中: ${i + 1} / ${jobs.length}件目...`);
      try {
        const matchResult = await getSingleMatchAnalysis(seekerInfo, job);
        const newResult = { ...job, matchResult };
        
        // Add result to the list in real-time and sort
        setResults(prevResults => 
            [...prevResults, newResult].sort((a, b) => b.matchResult.overallScore - a.matchResult.overallScore)
        );
        successfulMatches.push(newResult);

      } catch (e) {
        console.error(`Analysis failed for job: ${jobIdentifier}`, e);
        const errorMessage = e instanceof Error ? e.message : '不明なエラー';
        // Add a summary of the failed job to show at the end.
        failedJobSummaries.push(`${jobIdentifier} (${errorMessage})`);
      }
    }

    if (failedJobSummaries.length > 0) {
       setError(`警告: ${failedJobSummaries.length}件の求人分析に失敗しました。成功した結果のみ表示しています。 (詳細: ${failedJobSummaries.join(', ')})`);
    }
    
    setIsLoading(false);
    setProgressText('');
    
  }, [seekerInfo, jobs]);

  const isMatchButtonDisabled = isLoading || !seekerInfo || jobs.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <InputSection
            onSeekerInfoChange={setSeekerInfo}
            onJobsChange={setJobs}
            onStartMatch={handleMatch}
            isLoading={isLoading}
            isMatchButtonDisabled={isMatchButtonDisabled}
          />
          <ResultsSection 
            results={results} 
            isLoading={isLoading}
            error={error}
            progressText={progressText}
          />
        </div>
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} morich Job Matcher. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
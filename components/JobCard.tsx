import React, { useState } from 'react';
import { EnrichedJobData } from '../types';
import { Icons } from './icons/Icons';

interface JobCardProps {
  jobData: EnrichedJobData;
}

const ScoreBar: React.FC<{ score: number }> = ({ score }) => {
    const width = `${score}%`;
    let bgColor = 'bg-blue-500';
    if (score >= 80) bgColor = 'bg-green-500';
    else if (score >= 60) bgColor = 'bg-yellow-500';
    else if (score >= 40) bgColor = 'bg-orange-500';
    else bgColor = 'bg-red-500';

    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className={`${bgColor} h-2.5 rounded-full`} style={{ width }}></div>
        </div>
    );
};

const ScoreDetailItem: React.FC<{ label: string; score: number }> = ({ label, score }) => (
    <div className="flex items-center">
        <p className="w-1/3 text-sm text-gray-600">{label}</p>
        <div className="w-2/3 flex items-center gap-2">
            <ScoreBar score={score} />
            <span className="font-semibold text-sm w-10 text-right">{score}</span>
        </div>
    </div>
);


export const JobCard: React.FC<JobCardProps> = ({ jobData }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { matchResult } = jobData;
  const { overallScore, scoreBreakdown } = matchResult;

  const scoreColor = overallScore >= 80 ? 'text-green-600' : overallScore >= 60 ? 'text-yellow-600' : 'text-orange-600';

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm transition-shadow hover:shadow-md">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left flex items-center justify-between"
        aria-expanded={isExpanded}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm text-morich-red font-semibold">{jobData['企業名']}</p>
          <h3 className="text-lg font-bold text-gray-800 truncate">{jobData['ポジション']}</h3>
          <p className="text-xs text-gray-600 mt-1 truncate">{jobData['業務内容']}</p>
        </div>
        <div className="flex items-center gap-4 ml-4 flex-shrink-0">
            <div className="text-right">
                <p className="text-xs text-gray-500">マッチ度</p>
                <p className={`text-3xl font-bold ${scoreColor}`}>
                    {overallScore}<span className="text-base font-normal">/100</span>
                </p>
            </div>
          <Icons.ChevronDownIcon className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200">
          <div className="py-4 space-y-4">
             <div className="bg-sky-50 p-3 rounded-lg">
                <h4 className="font-semibold text-sky-800 flex items-center gap-2 mb-2"><Icons.SparklesIcon />一行サマリー</h4>
                <p className="text-sky-900">{matchResult.summary}</p>
             </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pros */}
                <div className="bg-green-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-green-800 flex items-center gap-2 mb-2"><Icons.CheckCircleIcon />マッチングポイント</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-green-900">
                        {matchResult.pros.map((pro, i) => <li key={`pro-${i}`}>{pro}</li>)}
                    </ul>
                </div>
                {/* Cons */}
                <div className="bg-red-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-red-800 flex items-center gap-2 mb-2"><Icons.XCircleIcon />ミスマッチ懸念点</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-900">
                        {matchResult.cons.map((con, i) => <li key={`con-${i}`}>{con}</li>)}
                    </ul>
                </div>
            </div>

            <div>
                <h4 className="font-semibold text-gray-700 flex items-center gap-2 mb-3"><Icons.ChartBarIcon />スコア詳細</h4>
                <div className="space-y-2">
                    <ScoreDetailItem label="経験・スキル" score={scoreBreakdown.experienceAndSkills} />
                    <ScoreDetailItem label="カルチャー" score={scoreBreakdown.cultureFit} />
                    <ScoreDetailItem label="条件" score={scoreBreakdown.conditions} />
                    <ScoreDetailItem label="キーワード" score={scoreBreakdown.keywords} />
                </div>
                 {matchResult.matchingKeywords && matchResult.matchingKeywords.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-semibold text-gray-700 flex items-center gap-2 mb-2"><Icons.TagIcon />マッチングキーワード</h4>
                        <div className="flex flex-wrap gap-2">
                            {matchResult.matchingKeywords.map((keyword, i) => (
                                <span key={`keyword-${i}`} className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
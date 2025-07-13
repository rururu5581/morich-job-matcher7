// The new, reduced CSV format
export interface JobDataBase {
  '企業名'?: string;
  '株式公開'?: string;
  'URL'?: string;
  '業種'?: string;
  '待遇・福利厚生'?: string;
  '従業員数'?: string;
  '求める人材像'?: string;
  '選考難易度'?: string;
  'メモ'?: string;
  'ポジション'?: string;
  '業務内容'?: string;
  '募集背景'?: string;
  '募集背景(詳細)'?: string;
  '給与(詳細)'?: string;
  '年齢制限の理由'?: string;
  '職種'?: string;
  '勤務地'?: string;
  '応募資格(概要)'?: string;
  '応募資格(詳細)'?: string;
  '★キーワード★'?: string;
  '年収下限 [万円]'?: string;
  '年収上限 [万円] (選択肢型)'?: string;
  'ざっくり職種'?: string;
  'リモートワーク制度'?: string;
  'リモート詳細'?: string;
  '副業可'?: string;
  [key: string]: any; // Allow other columns
}

// Type for raw CSV data.
export type JobData = JobDataBase;

export interface ScoreBreakdown {
  experienceAndSkills: number;
  cultureFit: number;
  conditions: number;
  keywords: number;
}

export interface MatchResult {
  overallScore: number;
  scoreBreakdown: ScoreBreakdown;
  matchingKeywords: string[];
  pros: string[];
  cons: string[];
  summary: string;
}

// Enriched data type for display.
export interface EnrichedJobData extends JobData {
  matchResult: MatchResult;
}

export enum InputTab {
  TEXT = 'Text',
  PDF = 'PDF',
}

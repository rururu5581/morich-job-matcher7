// 初期の設計に基づいた、完全なCSVフォーマットに対応するインターフェース
export interface JobDataBase {
  '企業 ID': string;
  '企業名': string;
  'ポジション': string;
  '業務内容': string;
  '募集背景': string;
  '求める人材像'?: string; // 以前の定義名も許容
  '求める人材'?: string; // 新しいCSVの定義名
  '応募資格(概要)': string;
  '応募資格(詳細)': string;
  '★キーワード★': string;
  '年収下限 [万円]': string;
  '年収上限 [万円]': string;
  '勤務地': string;
  
  // 補足情報として存在しうるフィールド
  '本社所在地 電話(企業)'?: string;
  '業種'?: string;
  '福利厚生'?: string;
  '休日休暇'?: string;
  '勤務時間'?: string;
  '事業内容・商品・サービス'?: string;
  'JOB ID'?: string;
  [key: string]: any; // 将来的な列の追加にも対応
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
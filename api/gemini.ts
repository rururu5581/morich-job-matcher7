import { GoogleGenAI, Type } from "@google/genai";
import type { JobData } from '../types';

// This function can run on the standard serverless runtime, no need for edge.
export const runtime = 'nodejs';

// Schema for ONE match result
const matchResultSchema: any = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER, description: "総合マッチスコア (0-100)" },
    scoreBreakdown: {
      type: Type.OBJECT,
      properties: {
        experienceAndSkills: { type: Type.NUMBER, description: "職務経験・スキルのスコア (0-100)" },
        cultureFit: { type: Type.NUMBER, description: "カルチャー・志向性のスコア (0-100)" },
        conditions: { type: Type.NUMBER, description: "年収・勤務地など条件のマッチ度スコア (0-100)" },
        keywords: { type: Type.NUMBER, description: "キーワードのマッチ度スコア (0-100)" },
      },
      required: ["experienceAndSkills", "cultureFit", "conditions", "keywords"]
    },
    matchingKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "マッチングに貢献したキーワードのリスト" },
    pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "マッチングしている点（良い点）の箇条書きリスト（2-3個）" },
    cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "ミスマッチの懸念点（悪い点）の箇条書きリスト（1-2個）" },
    summary: { type: Type.STRING, description: "このマッチングを要約した、キャッチーな一行" },
  },
  required: ["overallScore", "scoreBreakdown", "matchingKeywords", "pros", "cons", "summary"],
};

// Prompt for ONE job, updated for the new CSV format
const createSingleJobPrompt = (seekerInfo: string, job: JobData): string => {
  const jobInfoString = `
--- 求人情報 ---
- 企業名: ${job['企業名'] || 'N/A'}
- ポジション: ${job['ポジション'] || 'N/A'}
- 業務内容: ${job['業務内容'] || 'N/A'}
- 募集背景: ${job['募集背景'] || 'N/A'}
- 求める人材像: ${job['求める人材像'] || 'N/A'}
- 応募資格(概要): ${job['応募資格(概要)'] || 'N/A'}
- 応募資格(詳細): ${job['応募資格(詳細)'] || 'N/A'}
- 年収範囲: ${job['年収下限 [万円]'] || 'N/A'}万円〜${job['年収上限 [万円] (選択肢型)'] || 'N/A'}万円
- 勤務地: ${job['勤務地'] || 'N/A'}
- ★キーワード★: ${job['★キーワード★'] || 'N/A'}
- 待遇・福利厚生: ${job['待遇・福利厚生'] || 'N/A'}
`;

  return `あなたは「morich」という人材紹介会社のエキスパートキャリアエージェントです。提供された「求職者情報」と、一つの「求人情報」を深く分析し、両者がどれだけマッチしているかを客観的に評価してください。
以下の4つの観点と指定された比重に基づいて厳密に評価し、それぞれのスコア(0-100点)と、それらを加重平均した総合的なマッチスコア（0〜100点）を算出してください。
- A. 職務経験・スキルフィット (比重: 40%): 「業務内容」「応募資格」と求職者の経験がどれだけ合致しているか。
- B. カルチャー・志向性フィット (比重: 30%): 「求める人材像」「募集背景」から、求職者の価値観やキャリアプランとの相性を評価。
- C. 条件マッチ (比重: 20%): 「年収範囲」「勤務地」が求職者の希望と合っているか。
- D. キーワードシナジー (比重: 10%): 「★キーワード★」と求職者のスキル・経験の関連性。

最終的な出力は、必ず指定されたJSON形式に従ってください。評価の根拠となる「マッチングポイント」「ミスマッチポイント」、マッチングを促進する「一行サマリー」も生成してください。

# 求職者情報
${seekerInfo}

# 求人情報
${jobInfoString}
`;
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'APIキーがサーバーに設定されていません。' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { seekerInfo, job } = await request.json();

    if (!seekerInfo || !job) {
      return new Response(JSON.stringify({ error: 'リクエストに求職者情報または求人情報が含まれていません。' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = createSingleJobPrompt(seekerInfo, job);

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: matchResultSchema,
            temperature: 0.2,
        },
    });

    const responseText = response.text;
    const jsonStart = responseText.indexOf('{');
    const jsonEnd = responseText.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error("AIからの応答に有効なJSONが含まれていませんでした。");
    }

    const jsonString = responseText.substring(jsonStart, jsonEnd);
    const resultJson = JSON.parse(jsonString);

    return new Response(JSON.stringify(resultJson), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in /api/gemini:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: `API処理中にエラーが発生しました: ${errorMessage}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

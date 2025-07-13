import React, { useState, useCallback, useRef } from 'react';
import { InputTab, JobData } from '../types';
import { Icons } from './icons/Icons';
import Papa from 'papaparse';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.mjs`;

interface InputSectionProps {
  onSeekerInfoChange: (info: string) => void;
  onJobsChange: (jobs: JobData[]) => void;
  onStartMatch: () => void;
  isLoading: boolean;
  isMatchButtonDisabled?: boolean;
}

type FileStatus = {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
};

export const InputSection: React.FC<InputSectionProps> = ({ 
  onSeekerInfoChange, 
  onJobsChange, 
  onStartMatch, 
  isLoading, 
  isMatchButtonDisabled 
}) => {
  const [activeTab, setActiveTab] = useState<InputTab>(InputTab.TEXT);
  const [textInput, setTextInput] = useState('');
  const [pdfStatus, setPdfStatus] = useState<FileStatus>({ status: 'idle', message: '' });
  const [csvStatus, setCsvStatus] = useState<FileStatus>({ status: 'idle', message: '' });
  
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setTextInput(newText);
    onSeekerInfoChange(newText);
    if (pdfStatus.status !== 'idle') {
      setPdfStatus({ status: 'idle', message: '' });
    }
  };

  const handlePdfUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setTextInput('');
    onSeekerInfoChange('');
    setPdfStatus({ status: 'loading', message: `読込中: ${file.name}` });

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n\n';
        }
        onSeekerInfoChange(fullText.trim());
        setPdfStatus({ status: 'success', message: `${file.name} を読み込みました。`});
      } catch (error) {
        console.error('PDFの解析に失敗しました:', error);
        setPdfStatus({ status: 'error', message: 'PDFの解析に失敗しました。ファイルが破損していないか確認してください。' });
        onSeekerInfoChange('');
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = '';
  }, [onSeekerInfoChange]);
  
  const handleCsvUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    onJobsChange([]);
    setCsvStatus({ status: 'loading', message: `読込中: ${file.name}` });
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        if (results.errors.length > 0) {
            console.error('CSVの解析エラー:', results.errors);
            setCsvStatus({ status: 'error', message: 'CSVの解析に失敗しました。ファイルの形式が正しいか確認してください。' });
            onJobsChange([]);
            return;
        }
        
        const jobData = results.data as JobData[];
        if (jobData.length === 0 && file.size > 0) {
          console.warn('CSV parsed with 0 rows. This might be an encoding or header issue.');
          setCsvStatus({ status: 'error', message: '求人データの読み込みが0件でした。ファイルの文字コードが「UTF-8」になっているか、ヘッダー行が正しいか確認してください。' });
          onJobsChange([]);
          return;
        }

        onJobsChange(jobData);
        setCsvStatus({ status: 'success', message: `「${file.name}」から ${jobData.length}件の求人を読み込みました。` });
      },
      error: (error: any) => {
        console.error('CSVの解析に失敗しました:', error);
        setCsvStatus({ status: 'error', message: 'CSVファイルの読み込み中に予期せぬエラーが発生しました。' });
        onJobsChange([]);
      }
    });
    event.target.value = '';
  }, [onJobsChange]);

  const TabButton:React.FC<{tab:InputTab, label:string, icon:React.ReactNode}> = ({tab, label, icon}) => (
    <button
        onClick={() => setActiveTab(tab)}
        className={`flex-1 p-3 text-sm md:text-base font-semibold flex items-center justify-center gap-2 transition-colors duration-200 ${
        activeTab === tab ? 'bg-morich-red text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
        }`}
    >
        {icon}
        {label}
    </button>
  );

  const FileStatusMessage: React.FC<{ status: FileStatus }> = ({ status }) => {
    if (status.status === 'idle') return null;
    const color = status.status === 'success' ? 'text-green-700' : status.status === 'error' ? 'text-red-700' : 'text-gray-600';
    return <p className={`text-center mt-3 text-sm ${color}`}>{status.message}</p>;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1 text-gray-700">1. 求職者情報</h2>
        <p className="text-sm text-gray-500 mb-4">履歴書・職務経歴書の内容をテキストで貼り付けるか、PDFファイルをアップロードしてください。</p>
        <div className="flex rounded-t-lg overflow-hidden">
          <TabButton tab={InputTab.TEXT} label="テキスト入力" icon={<Icons.TextIcon />} />
          <TabButton tab={InputTab.PDF} label="PDFアップロード" icon={<Icons.FileTextIcon />} />
        </div>
        <div>
          {activeTab === InputTab.TEXT ? (
            <textarea
              value={textInput}
              onChange={handleTextChange}
              placeholder="ここに履歴書や面談メモを貼り付け..."
              className="w-full h-48 p-3 border border-gray-300 rounded-b-lg focus:ring-2 focus:ring-morich-red focus:border-transparent transition"
              aria-label="求職者情報テキスト入力"
            />
          ) : (
            <div className="border border-t-0 border-gray-300 rounded-b-lg p-4">
              <button
                onClick={() => pdfInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-md border-2 border-dashed border-gray-300 hover:bg-gray-200 hover:border-gray-400 transition-all duration-200"
              >
                <Icons.UploadIcon />
                <span>PDFファイルを選択</span>
              </button>
              <input type="file" accept=".pdf" ref={pdfInputRef} onChange={handlePdfUpload} className="hidden" />
              <FileStatusMessage status={pdfStatus} />
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-1 text-gray-700">2. 求人情報</h2>
        <p className="text-sm text-gray-500 mb-4">募集中の求人情報が記載されたCSVファイルをアップロードしてください。</p>
        <button
          onClick={() => csvInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-md border-2 border-dashed border-gray-300 hover:bg-gray-200 hover:border-gray-400 transition-all duration-200"
        >
          <Icons.UploadIcon />
          <span>求人CSVをアップロード</span>
        </button>
        <input type="file" accept=".csv" ref={csvInputRef} onChange={handleCsvUpload} className="hidden" />
        <p className="text-xs text-gray-500 text-center mt-2">ヒント: CSVファイルは <strong className="text-gray-600">UTF-8形式</strong> で保存してください。</p>
        <p className="text-xs text-gray-500 text-center mt-1">一度に多くの求人（推奨50件以下）を処理すると、分析に時間がかかる場合があります。</p>
        <FileStatusMessage status={csvStatus} />
      </div>
      
      <button
        onClick={onStartMatch}
        disabled={isMatchButtonDisabled}
        className="w-full py-4 px-6 bg-morich-red text-white font-bold text-lg rounded-lg shadow-md hover:bg-morich-red-dark transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        aria-live="polite"
      >
        {isLoading ? (
            <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                マッチング中...
            </>
        ) : 'マッチング開始'}
      </button>
    </div>
  );
};
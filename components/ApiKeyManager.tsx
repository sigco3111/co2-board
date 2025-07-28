import React, { useState, useEffect } from 'react';
import { KeyIcon } from './icons/KeyIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface ApiKeyManagerProps {
  isKeySet: boolean;
  onKeyUpdate: (key: string, action: 'save' | 'clear') => void;
  initialKey?: string;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ isKeySet, onKeyUpdate, initialKey = '' }) => {
  const [apiKeyInput, setApiKeyInput] = useState(initialKey);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setApiKeyInput(initialKey);
  }, [initialKey]);

  const handleSave = () => {
    if (apiKeyInput.trim()) {
      onKeyUpdate(apiKeyInput.trim(), 'save');
    }
  };

  const handleClear = () => {
    setApiKeyInput('');
    onKeyUpdate('', 'clear');
  };

  return (
    <div className="bg-navy-900/50 p-4 sm:p-6 rounded-2xl shadow-lg border border-navy-800 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <KeyIcon className="w-8 h-8 mr-4 text-navy-400" />
          <div>
            <h2 className="text-xl font-semibold text-white">Gemini API 키 관리</h2>
            {isKeySet ? (
              <div className="flex items-center mt-1 text-green-400">
                <CheckCircleIcon className="w-5 h-5 mr-1.5" />
                <span className="text-sm font-medium">API 키 활성</span>
              </div>
            ) : (
              <div className="flex items-center mt-1 text-yellow-400">
                <XCircleIcon className="w-5 h-5 mr-1.5" />
                <span className="text-sm font-medium">API 키 필요</span>
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-navy-400 sm:hidden mb-4">
          환경 변수에 키가 없으면, 여기에 Gemini API 키를 입력하세요. 키는 로컬 저장소에만 저장됩니다.
        </p>
      </div>
      <div className="mt-4 flex flex-col md:flex-row gap-2">
        <div className="relative flex-grow">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            className="w-full bg-navy-950 border-2 border-navy-700 rounded-lg p-3 pr-12 text-white placeholder:text-navy-500 focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition"
            placeholder="Gemini API 키를 여기에 붙여넣으세요..."
            aria-label="Gemini API Key Input"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-navy-400 hover:text-white"
            aria-label={showKey ? '키 숨기기' : '키 보기'}
            title={showKey ? '키 숨기기' : '키 보기'}
          >
            {showKey ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><path d="m2 2 20 20"/></svg>
            )}
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!apiKeyInput.trim()}
            className="flex-1 md:flex-none bg-navy-600 hover:bg-navy-500 text-white font-bold py-3 px-5 rounded-lg transition-colors disabled:bg-navy-800 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            키 저장
          </button>
          <button
            onClick={handleClear}
            className="flex-1 md:flex-none bg-red-800/70 hover:bg-red-700 text-white font-bold py-3 px-5 rounded-lg transition-colors"
          >
            지우기
          </button>
        </div>
      </div>
      <p className="hidden sm:block text-xs text-navy-400 mt-3">
        환경 변수(`process.env.API_KEY`)에 키가 설정되어 있지 않은 경우, 여기에 Gemini API 키를 입력하세요. 키는 브라우저의 로컬 저장소에만 안전하게 저장됩니다.
      </p>
    </div>
  );
};
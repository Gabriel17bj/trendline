import React, { useState } from 'react';
import { Key, ExternalLink, X, Check, ShieldCheck, Sparkles } from 'lucide-react';

interface ApiKeyModalProps {
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  apiKey,
  onSaveApiKey,
  onClose,
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiKey(inputKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleClear = () => {
    setInputKey('');
    onSaveApiKey('');
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-500/30 rounded-xl border border-indigo-400/30">
              <Key className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Gemini AI API 키 설정</h3>
              <p className="text-xs text-indigo-200">AI 교사 피드백 기능 전용 API 키</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-indigo-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-900 space-y-1.5">
            <div className="flex items-center space-x-1.5 font-semibold text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>무료 API 키 사용 가이드</span>
            </div>
            <p className="leading-relaxed text-slate-600">
              API 키를 입력하지 않으셔도 <strong className="text-indigo-800">기본 제공 시스템 구글 제미나이 무료 API</strong>로 피드백을 바로 이용할 수 있습니다.
            </p>
            <p className="leading-relaxed text-slate-600">
              개인 무료 Gemini API 키를 직접 등록하여 사용하고자 하시면 아래에 입력해 주세요.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Google Gemini API Key (선택 사항)
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="AIzaSy..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="w-full text-xs p-3 pr-16 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-medium text-slate-500 hover:text-indigo-600 px-2 py-1 rounded bg-slate-200/60"
              >
                {showKey ? '숨기기' : '보기'}
              </button>
            </div>
          </div>

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium underline underline-offset-2"
          >
            <span>Google AI Studio에서 무료 API 키 발급받기</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {savedSuccess && (
            <div className="flex items-center space-x-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
              <Check className="w-4 h-4" />
              <span>API 키 설정이 저장되었습니다.</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            {inputKey && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl font-medium transition"
              >
                기본 무료 API로 변경
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React from 'react';
import { LineChart, FileSpreadsheet, Download, FileText, FolderOpen, Save, RefreshCw, UserCheck, Key, Code } from 'lucide-react';
import { StudentInfo } from '../types';

interface HeaderProps {
  studentInfo: StudentInfo;
  userApiKey: string;
  onOpenStudentModal: () => void;
  onOpenPresetsModal: () => void;
  onOpenApiKeyModal: () => void;
  onExportReport: () => void;
  onSaveProject: () => void;
  onLoadProject: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  studentInfo,
  userApiKey,
  onOpenStudentModal,
  onOpenPresetsModal,
  onOpenApiKeyModal,
  onExportReport,
  onSaveProject,
  onLoadProject,
  onReset,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const hasStudentInfo = studentInfo.name || studentInfo.schoolName;

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-inner text-white flex items-center justify-center">
              <LineChart className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  고교 데이터 추세선 분석기
                </h1>
                <span className="text-xs bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full font-medium">
                  선형 회귀 탐구
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-400 hidden sm:flex">
                <span>데이터 분석 · 상관관계 · 리포트 PDF</span>
                <span className="text-slate-600">•</span>
                <span className="text-indigo-300 font-medium flex items-center gap-1">
                  <Code className="w-3 h-3 text-indigo-400" />
                  Dev: Gabriel Math (Gabriel Byeongje Jeon)
                </span>
              </div>
            </div>
          </div>

          {/* Student Info Quick Badge */}
          <div className="hidden lg:flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-lg">
            <UserCheck className="w-4 h-4 text-indigo-400" />
            <div className="text-xs">
              {hasStudentInfo ? (
                <span className="text-slate-200 font-medium">
                  {studentInfo.schoolName ? `${studentInfo.schoolName} ` : ''}
                  {studentInfo.gradeClass ? `${studentInfo.gradeClass} ` : ''}
                  <span className="text-indigo-300 font-semibold">{studentInfo.name || '학생'}</span>
                </span>
              ) : (
                <span className="text-slate-400">학생 정보 미입력</span>
              )}
            </div>
            <button
              onClick={onOpenStudentModal}
              className="ml-1 text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
            >
              {hasStudentInfo ? '수정' : '입력하기'}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Gemini API Key Button */}
            <button
              onClick={onOpenApiKeyModal}
              className={`flex items-center space-x-1.5 text-xs font-medium px-2.5 py-2 rounded-lg border transition ${
                userApiKey
                  ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-200 hover:bg-indigo-900/80'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="AI 피드백용 Gemini API 키 설정"
            >
              <Key className={`w-4 h-4 ${userApiKey ? 'text-indigo-400' : 'text-amber-400'}`} />
              <span className="hidden md:inline">API 키 설정</span>
              {userApiKey && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
            </button>

            {/* Presets Data */}
            <button
              onClick={onOpenPresetsModal}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-2 rounded-lg border border-slate-700 transition"
              title="탐구용 샘플 데이터 불러오기"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">샘플 데이터</span>
            </button>

            {/* Load JSON */}
            <label className="cursor-pointer flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-2.5 py-2 rounded-lg border border-slate-700 transition">
              <FolderOpen className="w-4 h-4 text-amber-400" />
              <span className="hidden xl:inline">불러오기</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={onLoadProject}
                className="hidden"
              />
            </label>

            {/* Save JSON */}
            <button
              onClick={onSaveProject}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-2.5 py-2 rounded-lg border border-slate-700 transition"
              title="작업 내역 저장하기 (JSON)"
            >
              <Save className="w-4 h-4 text-sky-400" />
              <span className="hidden xl:inline">저장</span>
            </button>

            {/* Reset */}
            <button
              onClick={onReset}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              title="데이터 초기화"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Report Export Button */}
            <button
              onClick={onExportReport}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>리포트 PDF</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};


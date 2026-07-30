/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { DataPoint, ModelType, PredictionResult, ReflectionData, SampleDataset, StudentInfo } from './types';
import { calculateRegression } from './utils/regression';
import { SAMPLE_DATASETS } from './utils/sampleData';
import { Header } from './components/Header';
import { StudentInfoForm } from './components/StudentInfoForm';
import { DataInputSection } from './components/DataInputSection';
import { RegressionChart } from './components/RegressionChart';
import { StatsSummaryPanel } from './components/StatsSummaryPanel';
import { PredictionTool } from './components/PredictionTool';
import { ReflectionSection } from './components/ReflectionSection';
import { ReportModal } from './components/ReportModal';
import { PresetsModal } from './components/PresetsModal';
import { ApiKeyModal } from './components/ApiKeyModal';

const LOCAL_STORAGE_KEY = 'highschool_trendline_app_state';
const API_KEY_STORAGE_KEY = 'gemini_user_api_key';

export default function App() {
  // Default Initial Dataset: Hooke's Law
  const defaultSample = SAMPLE_DATASETS[0];

  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    schoolName: '',
    gradeClass: '',
    studentId: '',
    name: '',
    subject: '물리학 I / 수학',
    topic: defaultSample.title,
    date: new Date().toISOString().split('T')[0],
  });

  const [xName, setXName] = useState<string>(defaultSample.xName);
  const [xUnit, setXUnit] = useState<string>(defaultSample.xUnit);
  const [yName, setYName] = useState<string>(defaultSample.yName);
  const [yUnit, setYUnit] = useState<string>(defaultSample.yUnit);

  const [points, setPoints] = useState<DataPoint[]>(
    defaultSample.points.map((p, idx) => ({
      id: `pt_${idx}_${Date.now()}`,
      x: p.x,
      y: p.y,
      label: p.label,
      enabled: true,
    }))
  );

  const [selectedModel, setSelectedModel] = useState<ModelType>('linear');

  const [reflection, setReflection] = useState<ReflectionData>({
    slopeMeaning: defaultSample.defaultSlopeMeaning || '',
    interceptMeaning: defaultSample.defaultInterceptMeaning || '',
    rSquaredInterpretation: '',
    conclusion: '',
    questionsAndCuriosity: '',
  });

  const [activePrediction, setActivePrediction] = useState<PredictionResult | null>(null);

  // Gemini API Key State
  const [userApiKey, setUserApiKey] = useState<string>('');

  // Modals
  const [isStudentModalOpen, setIsStudentModalOpen] = useState<boolean>(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  // Auto Restore / Save Local Storage
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
      if (savedKey) setUserApiKey(savedKey);

      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.studentInfo) setStudentInfo(parsed.studentInfo);
        if (parsed.points) setPoints(parsed.points);
        if (parsed.xName) setXName(parsed.xName);
        if (parsed.xUnit) setXUnit(parsed.xUnit);
        if (parsed.yName) setYName(parsed.yName);
        if (parsed.yUnit) setYUnit(parsed.yUnit);
        if (parsed.selectedModel) setSelectedModel(parsed.selectedModel);
        if (parsed.reflection) setReflection(parsed.reflection);
      }
    } catch (e) {
      console.error('Failed to load local storage:', e);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setUserApiKey(key);
    if (key) {
      localStorage.setItem(API_KEY_STORAGE_KEY, key);
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  };

  useEffect(() => {
    try {
      const stateToSave = {
        studentInfo,
        points,
        xName,
        xUnit,
        yName,
        yUnit,
        selectedModel,
        reflection,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save local storage:', e);
    }
  }, [studentInfo, points, xName, xUnit, yName, yUnit, selectedModel, reflection]);

  // Compute Regression Result Live
  const regression = useMemo(() => {
    return calculateRegression(points, selectedModel);
  }, [points, selectedModel]);

  // Handler: Load Sample Dataset
  const handleLoadSample = (sample: SampleDataset) => {
    setXName(sample.xName);
    setXUnit(sample.xUnit);
    setYName(sample.yName);
    setYUnit(sample.yUnit);
    setStudentInfo((prev) => ({ ...prev, topic: sample.title }));
    setPoints(
      sample.points.map((p, idx) => ({
        id: `pt_${idx}_${Date.now()}`,
        x: p.x,
        y: p.y,
        label: p.label,
        enabled: true,
      }))
    );
    setReflection({
      slopeMeaning: sample.defaultSlopeMeaning || '',
      interceptMeaning: sample.defaultInterceptMeaning || '',
      rSquaredInterpretation: '',
      conclusion: '',
      questionsAndCuriosity: '',
    });
    setActivePrediction(null);
  };

  // Save Project JSON File
  const handleSaveProject = () => {
    const data = {
      studentInfo,
      points,
      xName,
      xUnit,
      yName,
      yUnit,
      selectedModel,
      reflection,
      version: '1.0',
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `추세선_탐구작업_${studentInfo.name || '학생'}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Load Project JSON File
  const handleLoadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.studentInfo) setStudentInfo(parsed.studentInfo);
        if (parsed.points) setPoints(parsed.points);
        if (parsed.xName) setXName(parsed.xName);
        if (parsed.xUnit) setXUnit(parsed.xUnit);
        if (parsed.yName) setYName(parsed.yName);
        if (parsed.yUnit) setYUnit(parsed.yUnit);
        if (parsed.selectedModel) setSelectedModel(parsed.selectedModel);
        if (parsed.reflection) setReflection(parsed.reflection);
      } catch (err) {
        alert('올바른 탐구 작업 JSON 파일이 아닙니다.');
      }
    };
    reader.readAsText(file);
  };

  // Reset Data
  const handleReset = () => {
    if (confirm('모든 데이터를 초기화하시겠습니까?')) {
      handleLoadSample(defaultSample);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col antialiased">
      {/* Header Bar */}
      <Header
        studentInfo={studentInfo}
        userApiKey={userApiKey}
        onOpenStudentModal={() => setIsStudentModalOpen(true)}
        onOpenPresetsModal={() => setIsPresetsModalOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onExportReport={() => setIsReportModalOpen(true)}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
        onReset={handleReset}
      />

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6 w-full">
        {/* Top Grid: Left Data Input & Right Trendline Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Data Input Section (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <DataInputSection
              points={points}
              xName={xName}
              xUnit={xUnit}
              yName={yName}
              yUnit={yUnit}
              onPointsChange={setPoints}
              onXNameChange={setXName}
              onXUnitChange={setXUnit}
              onYNameChange={setYName}
              onYUnitChange={setYUnit}
              onLoadSample={handleLoadSample}
            />
          </div>

          {/* Right: Trendline Regression Chart & Model Select (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <RegressionChart
              points={points}
              regression={regression}
              xName={xName}
              xUnit={xUnit}
              yName={yName}
              yUnit={yUnit}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              activePrediction={activePrediction}
            />
          </div>
        </div>

        {/* Math & Statistical Summary Panel */}
        <StatsSummaryPanel
          regression={regression}
          xName={xName}
          xUnit={xUnit}
          yName={yName}
          yUnit={yUnit}
        />

        {/* Prediction Tool Simulator */}
        <PredictionTool
          regression={regression}
          xName={xName}
          xUnit={xUnit}
          yName={yName}
          yUnit={yUnit}
          onPredictionChange={setActivePrediction}
        />

        {/* Student Reflection & Thought Log */}
        <ReflectionSection
          reflection={reflection}
          onChange={setReflection}
          regression={regression}
          studentInfo={studentInfo}
          xName={xName}
          xUnit={xUnit}
          yName={yName}
          yUnit={yUnit}
          userApiKey={userApiKey}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        />
      </main>

      {/* Student Info Modal */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <StudentInfoForm
            studentInfo={studentInfo}
            onChange={setStudentInfo}
            onClose={() => setIsStudentModalOpen(false)}
          />
        </div>
      )}

      {/* Presets Sample Modal */}
      {isPresetsModalOpen && (
        <PresetsModal
          onSelectSample={handleLoadSample}
          onClose={() => setIsPresetsModalOpen(false)}
        />
      )}

      {/* Gemini API Key Modal */}
      {isApiKeyModalOpen && (
        <ApiKeyModal
          apiKey={userApiKey}
          onSaveApiKey={handleSaveApiKey}
          onClose={() => setIsApiKeyModalOpen(false)}
        />
      )}

      {/* Printable / Report Modal with PDF Export */}
      {isReportModalOpen && (
        <ReportModal
          studentInfo={studentInfo}
          points={points}
          regression={regression}
          reflection={reflection}
          xName={xName}
          xUnit={xUnit}
          yName={yName}
          yUnit={yUnit}
          activePrediction={activePrediction}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {/* Simple Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 space-y-1">
        <p className="font-medium text-slate-700">
          고교 데이터 추세선 분석기 &copy; 2026 — 학생 탐구활동 및 선형회귀 학습 보고서 생성기
        </p>
        <p className="text-indigo-600 font-semibold">
          Developer: Gabriel Math (Gabriel Byeongje Jeon)
        </p>
      </footer>
    </div>
  );
}

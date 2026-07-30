import React, { useState } from 'react';
import { PenTool, Sparkles, HelpCircle, Lightbulb, MessageSquareQuote, Key, ShieldCheck } from 'lucide-react';
import { ReflectionData, RegressionResult, StudentInfo } from '../types';

interface ReflectionSectionProps {
  reflection: ReflectionData;
  onChange: (updated: ReflectionData) => void;
  regression: RegressionResult | null;
  studentInfo: StudentInfo;
  xName: string;
  xUnit: string;
  yName: string;
  yUnit: string;
  userApiKey: string;
  onOpenApiKeyModal: () => void;
}

export const ReflectionSection: React.FC<ReflectionSectionProps> = ({
  reflection,
  onChange,
  regression,
  studentInfo,
  xName,
  xUnit,
  yName,
  yUnit,
  userApiKey,
  onOpenApiKeyModal,
}) => {
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleFieldChange = (field: keyof ReflectionData, value: string) => {
    onChange({ ...reflection, [field]: value });
  };

  // Auto-fill template helper
  const handleAutoFillGuide = () => {
    if (!regression) return;
    const { coefficients, rSquared } = regression;
    const aVal = coefficients.a.toFixed(3);
    const bVal = coefficients.b.toFixed(3);

    onChange({
      slopeMeaning: `${xName || 'X'}가 1 ${xUnit || '단위'} 증가할 때마다 ${yName || 'Y'}가 평균적으로 약 ${aVal} ${yUnit || '단위'}만큼 증가(또는 감소)한다는 의미입니다.`,
      interceptMeaning: `${xName || 'X'}가 0 ${xUnit || '단위'}일 때 ${yName || 'Y'}의 초기 가상 예측값은 약 ${bVal} ${yUnit || '단위'}입니다.`,
      rSquaredInterpretation: `결정계수 R² = ${rSquared.toFixed(4)}로, 본 추세선 모델은 관측 데이터 변동의 ${(rSquared * 100).toFixed(1)}%를 잘 설명하고 있습니다.`,
      conclusion: `이번 탐구를 통해 ${xName || 'X'}와 ${yName || 'Y'} 사이에 강한 경향성이 존재함을 확인하였으며, 추세선 수식을 활용해 향후 실험 데이터를 예측할 수 있게 되었습니다.`,
      questionsAndCuriosity: `실험 중 오차가 발생한 요인(측정 기기 오차, 환경 변수 등)을 통제하면 더 높은 신뢰도의 추세선을 얻을 수 있을 것입니다.`,
    });
  };

  // Request AI Teacher Feedback
  const handleRequestAiFeedback = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiFeedback(null);

    try {
      const res = await fetch('/api/ai-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userApiKey: userApiKey || undefined,
          topic: studentInfo.topic,
          xName,
          yName,
          equationText: regression?.equationText,
          rSquared: regression?.rSquared,
          slopeMeaning: reflection.slopeMeaning,
          interceptMeaning: reflection.interceptMeaning,
          conclusion: reflection.conclusion,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI 피드백 요청에 실패했습니다.');
      }
      setAiFeedback(data.feedback);
    } catch (err: any) {
      setAiError(err.message || '오류가 발생했습니다.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              추세선 분석 및 학생 고찰 (생각 기록하기)
            </h3>
            <p className="text-xs text-slate-500">
              계산된 추세선 수식과 통계지표의 물리적·수학적 의미를 본인의 언어로 정리해 보세요.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Key status indicator button */}
          <button
            onClick={onOpenApiKeyModal}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-2.5 py-1.5 rounded-xl transition border border-slate-200"
            title="Gemini API 키 변경/설정"
          >
            <Key className={`w-3.5 h-3.5 ${userApiKey ? 'text-indigo-600' : 'text-amber-500'}`} />
            <span>{userApiKey ? '개인 API 키 적용중' : '무료 API 키 사용중'}</span>
          </button>

          <button
            onClick={handleAutoFillGuide}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition border border-slate-200"
            title="초기 작성용 가이드 문장 채우기"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>가이드문 예시</span>
          </button>

          <button
            onClick={handleRequestAiFeedback}
            disabled={aiLoading}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span>{aiLoading ? 'AI 멘토 분석 중...' : 'AI 교사 피드백 받기'}</span>
          </button>
        </div>
      </div>

      {/* Questions Form Grid */}
      <div className="space-y-4">
        {/* Q1: Slope Meaning */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
            <span>
              1. 기울기($a = {regression ? regression.coefficients.a.toFixed(3) : 'a'}$)의 실제 의미 해석
            </span>
            <span className="text-[11px] text-indigo-600 font-normal">
              * X 1단위 증가 시 Y의 변화량
            </span>
          </label>
          <textarea
            rows={2}
            placeholder="예: 추의 질량(X)이 1g 늘어날 때마다 용수철 길이(Y)가 약 0.049cm 늘어남을 의미합니다."
            value={reflection.slopeMeaning}
            onChange={(e) => handleFieldChange('slopeMeaning', e.target.value)}
            className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* Q2: Intercept Meaning */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
            <span>
              2. Y절편($b = {regression ? regression.coefficients.b.toFixed(3) : 'b'}$)의 실제 의미 해석
            </span>
            <span className="text-[11px] text-indigo-600 font-normal">
              * X가 0일 때의 Y의 시작값
            </span>
          </label>
          <textarea
            rows={2}
            placeholder="예: 추의 질량이 0g일 때의 기본 용수철 상태 길이 또는 영점 오차를 뜻합니다."
            value={reflection.interceptMeaning}
            onChange={(e) => handleFieldChange('interceptMeaning', e.target.value)}
            className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* Q3: R² Interpretation */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            3. 결정계수($R^2 = {regression ? regression.rSquared.toFixed(4) : 'R²'}$) 및 추세선의 신뢰도 평가
          </label>
          <textarea
            rows={2}
            placeholder="예: R² 값이 0.98 이상으로 매우 높아 실험 데이터가 선형 관계에 매우 잘 부합함을 알 수 있습니다."
            value={reflection.rSquaredInterpretation}
            onChange={(e) => handleFieldChange('rSquaredInterpretation', e.target.value)}
            className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* Q4: Overall Conclusion */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            4. 탐구 결론 및 종합 소감
          </label>
          <textarea
            rows={3}
            placeholder="실험을 통해 확인한 사실, 추세선의 활용 가능성, 오차 분석 및 느낀 점을 자유롭게 적어주세요."
            value={reflection.conclusion}
            onChange={(e) => handleFieldChange('conclusion', e.target.value)}
            className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* AI Teacher Feedback Result Banner */}
      {aiError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
          {aiError}
        </div>
      )}

      {aiFeedback && (
        <div className="bg-indigo-50/80 border border-indigo-200 p-4 rounded-2xl space-y-2">
          <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs">
            <MessageSquareQuote className="w-4 h-4 text-indigo-600" />
            <span>AI 교사 피드백 및 조언</span>
          </div>
          <div className="text-xs text-indigo-950 leading-relaxed whitespace-pre-line bg-white/80 p-3 rounded-xl border border-indigo-100">
            {aiFeedback}
          </div>
        </div>
      )}
    </div>
  );
};

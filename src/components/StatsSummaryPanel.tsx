import React from 'react';
import { Calculator, Award, TrendingUp, HelpCircle, Activity } from 'lucide-react';
import { RegressionResult } from '../types';
import { formatNum, getCorrelationDescription } from '../utils/regression';

interface StatsSummaryPanelProps {
  regression: RegressionResult | null;
  xName: string;
  xUnit: string;
  yName: string;
  yUnit: string;
}

export const StatsSummaryPanel: React.FC<StatsSummaryPanelProps> = ({
  regression,
  xName,
  xUnit,
  yName,
  yUnit,
}) => {
  if (!regression) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-500 text-xs">
        데이터를 2개 이상 입력해야 통계 및 수식을 분석할 수 있습니다.
      </div>
    );
  }

  const { coefficients, rSquared, r, rmse, xMean, yMean, n } = regression;
  const correlationInfo = getCorrelationDescription(r);

  return (
    <div className="space-y-4">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Regression Equation & Coefficients */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5" /> 추세선 방정식
              </span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md font-mono">
                최소제곱법
              </span>
            </div>

            <div className="my-2 bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 font-mono text-center">
              <div className="text-lg font-bold text-indigo-300 tracking-tight">
                {regression.equationText}
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 mt-3 pt-3 border-t border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">기울기 (a):</span>
                <span className="font-mono font-bold text-white">
                  {formatNum(coefficients.a)}
                  <span className="text-[10px] text-slate-400 font-normal ml-1">
                    ({yUnit ? `${yUnit}/` : ''}{xUnit || '단위'})
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Y절편 (b):</span>
                <span className="font-mono font-bold text-white">
                  {formatNum(coefficients.b)}
                  <span className="text-[10px] text-slate-400 font-normal ml-1">
                    {yUnit ? `(${yUnit})` : ''}
                  </span>
                </span>
              </div>
              {coefficients.c !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">2차항 계수 (c):</span>
                  <span className="font-mono font-bold text-white">
                    {formatNum(coefficients.c)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: R² (Coeff of Determination) Reliability */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" /> 결정계수 (R²)
              </span>
              <span className="text-xs font-bold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                {(rSquared * 100).toFixed(1)}%
              </span>
            </div>

            <div className="text-2xl font-black text-slate-900 font-mono my-1">
              R² = {rSquared.toFixed(4)}
            </div>

            {/* Progress Gauge Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden my-3">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, rSquared * 100)}%` }}
              ></div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              독립변수 <b>{xName || 'X'}</b>의 변화로 종속변수 <b>{yName || 'Y'}</b> 변화의{' '}
              <b className="text-indigo-600">{(rSquared * 100).toFixed(1)}%</b>를 설명할 수 있습니다.
              (100%에 가까울수록 모델 신뢰도가 매우 높음)
            </p>
          </div>
        </div>

        {/* Card 3: Correlation r & Statistics */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> 피어슨 상관계수 (r)
              </span>
              <span className="text-xs font-mono font-bold text-slate-800">
                r = {r.toFixed(4)}
              </span>
            </div>

            <div className={`mt-2 p-2.5 rounded-xl border text-xs font-semibold ${correlationInfo.color}`}>
              {correlationInfo.text}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3">
              <div>
                <span className="text-slate-400 block text-[10px]">데이터 개수 (N)</span>
                <span className="font-mono font-bold text-slate-800">{n}개</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">평균 제곱근 오차 (RMSE)</span>
                <span className="font-mono font-bold text-slate-800">{formatNum(rmse, 3)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">X 평균 (x̄)</span>
                <span className="font-mono font-bold text-slate-800">{formatNum(xMean, 2)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Y 평균 (ȳ)</span>
                <span className="font-mono font-bold text-slate-800">{formatNum(yMean, 2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

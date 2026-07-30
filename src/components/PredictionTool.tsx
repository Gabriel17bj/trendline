import React, { useState, useEffect } from 'react';
import { Target, ArrowRight, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { PredictionResult, RegressionResult } from '../types';
import { predictFromModel, formatNum } from '../utils/regression';

interface PredictionToolProps {
  regression: RegressionResult | null;
  xName: string;
  xUnit: string;
  yName: string;
  yUnit: string;
  onPredictionChange: (pred: PredictionResult | null) => void;
}

export const PredictionTool: React.FC<PredictionToolProps> = ({
  regression,
  xName,
  xUnit,
  yName,
  yUnit,
  onPredictionChange,
}) => {
  const [mode, setMode] = useState<'xToY' | 'yToX'>('xToY');
  const [inputValue, setInputValue] = useState<string>('');
  const [result, setResult] = useState<PredictionResult | null>(null);

  useEffect(() => {
    if (!regression || !inputValue || isNaN(parseFloat(inputValue))) {
      setResult(null);
      onPredictionChange(null);
      return;
    }

    const numVal = parseFloat(inputValue);
    const { predictedVal, isExtrapolation } = predictFromModel(regression, numVal, mode);

    const notes = isExtrapolation
      ? `관측 데이터 범위(${formatNum(regression.minX)} ~ ${formatNum(regression.maxX)} ${xUnit})를 벗어난 '외삽(Extrapolation)' 예측입니다. 실제 실험 환경에서 추세선이 지속되지 않을 가능성을 유의하세요.`
      : `관측 데이터 범위 안의 '내삽(Interpolation)' 예측입니다. 추세선의 신뢰도가 매우 높습니다.`;

    const predObj: PredictionResult = {
      inputVal: numVal,
      predictedVal,
      type: mode,
      isExtrapolation,
      notes,
    };

    setResult(predObj);
    onPredictionChange(predObj);
  }, [inputValue, mode, regression]);

  if (!regression) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">추세선 예측 시뮬레이터</h3>
            <p className="text-[11px] text-slate-500">
              새로운 변수 값을 입력하여 미래 데이터 또는 미지의 상황을 예측해 보세요.
            </p>
          </div>
        </div>

        {/* Mode Selector Toggle */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => {
              setMode('xToY');
              setInputValue('');
            }}
            className={`px-3 py-1 rounded-lg transition ${
              mode === 'xToY' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {xName || 'X'}값으로 {yName || 'Y'} 예측
          </button>
          <button
            onClick={() => {
              setMode('yToX');
              setInputValue('');
            }}
            className={`px-3 py-1 rounded-lg transition ${
              mode === 'yToX' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            목표 {yName || 'Y'}값으로 {xName || 'X'} 추정
          </button>
        </div>
      </div>

      {/* Input & Output Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            {mode === 'xToY'
              ? `임의의 ${xName || 'X'} 값 입력`
              : `목표 ${yName || 'Y'} 값 입력`}
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              step="any"
              placeholder={`예: ${
                mode === 'xToY'
                  ? formatNum((regression.minX + regression.maxX) / 2)
                  : formatNum((regression.minY + regression.maxY) / 2)
              }`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 text-sm font-mono px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
            <span className="text-xs font-bold text-slate-500">
              {mode === 'xToY' ? xUnit : yUnit}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            * 관측 범위: {formatNum(regression.minX)} ~ {formatNum(regression.maxX)} {xUnit}
          </p>
        </div>

        {/* Prediction Display Result */}
        <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80 flex flex-col justify-between h-full space-y-2">
          <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> 예측 결과
          </span>

          {result ? (
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-bold font-mono text-amber-950">
                  {formatNum(result.predictedVal, 3)}
                </span>
                <span className="text-xs font-bold text-amber-800">
                  {mode === 'xToY' ? yUnit : xUnit}
                </span>
              </div>

              {/* Interpolation vs Extrapolation Badge */}
              <div className="mt-2 flex items-center space-x-2">
                {result.isExtrapolation ? (
                  <span className="flex items-center space-x-1 text-[11px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md border border-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-800" />
                    <span>외삽 (Extrapolation - 범위 밖)</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>내삽 (Interpolation - 범위 안)</span>
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-amber-700/70 italic">
              왼쪽 상자에 입력값을 작성하면 추세선 수식에 의해 자동 계산됩니다.
            </p>
          )}
        </div>
      </div>

      {result && (
        <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
          <b>해석 가이드:</b> {result.notes}
        </p>
      )}
    </div>
  );
};

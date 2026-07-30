import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { Layers, Eye, Sparkles, SlidersHorizontal } from 'lucide-react';
import { DataPoint, ModelType, RegressionResult, PredictionResult } from '../types';

interface RegressionChartProps {
  points: DataPoint[];
  regression: RegressionResult | null;
  xName: string;
  xUnit: string;
  yName: string;
  yUnit: string;
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
  activePrediction?: PredictionResult | null;
  predictionXInput?: number | null;
}

export const RegressionChart: React.FC<RegressionChartProps> = ({
  points,
  regression,
  xName,
  xUnit,
  yName,
  yUnit,
  selectedModel,
  onModelChange,
  activePrediction,
  predictionXInput,
}) => {
  const [showResiduals, setShowResiduals] = useState<boolean>(false);
  const [showFormula, setShowFormula] = useState<boolean>(true);
  const [chartColor, setChartColor] = useState<string>('#4f46e5'); // indigo

  // Filter points
  const activePoints = useMemo(
    () => points.filter((p) => p.enabled !== false && !isNaN(p.x) && !isNaN(p.y)),
    [points]
  );
  const disabledPoints = useMemo(
    () => points.filter((p) => p.enabled === false && !isNaN(p.x) && !isNaN(p.y)),
    [points]
  );

  // Compute Trendline Curve Points
  const trendlinePoints = useMemo(() => {
    if (!regression || activePoints.length === 0) return [];

    const minX = Math.min(...activePoints.map((p) => p.x));
    const maxX = Math.max(...activePoints.map((p) => p.x));
    const span = maxX - minX || 10;
    
    // Add 15% margin on both ends for trendline view
    const startX = minX - span * 0.15;
    const endX = maxX + span * 0.15;

    const steps = 60;
    const stepSize = (endX - startX) / steps;
    const result: { x: number; trendY: number }[] = [];

    const { a, b, c } = regression.coefficients;

    for (let i = 0; i <= steps; i++) {
      const curX = startX + i * stepSize;
      let curY = 0;

      if (selectedModel === 'linear') {
        curY = a * curX + b;
      } else if (selectedModel === 'quadratic') {
        curY = a * curX * curX + b * curX + (c ?? 0);
      } else if (selectedModel === 'exponential') {
        curY = a * Math.exp(b * curX);
      } else if (selectedModel === 'logarithmic') {
        curY = curX > 0 ? a * Math.log(curX) + b : 0;
      }

      if (!isNaN(curY) && isFinite(curY)) {
        result.push({ x: parseFloat(curX.toFixed(3)), trendY: parseFloat(curY.toFixed(3)) });
      }
    }

    return result;
  }, [regression, activePoints, selectedModel]);

  // Combine data for Recharts composed view
  const formattedActiveData = useMemo(() => {
    return activePoints.map((p) => ({
      x: p.x,
      y: p.y,
      label: p.label || `(${p.x}, ${p.y})`,
    }));
  }, [activePoints]);

  const formattedDisabledData = useMemo(() => {
    return disabledPoints.map((p) => ({
      x: p.x,
      y: p.y,
      label: p.label ? `${p.label} (제외됨)` : `(${p.x}, ${p.y}) [제외]`,
    }));
  }, [disabledPoints]);

  const xDomain = useMemo(() => {
    if (activePoints.length === 0) return [0, 10];
    const xs = activePoints.map((p) => p.x);
    if (predictionXInput !== undefined && predictionXInput !== null) {
      xs.push(predictionXInput);
    }
    const min = Math.min(...xs);
    const max = Math.max(...xs);
    const margin = (max - min) * 0.15 || 2;
    return [parseFloat((min - margin).toFixed(2)), parseFloat((max + margin).toFixed(2))];
  }, [activePoints, predictionXInput]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col justify-between space-y-4">
      {/* Chart Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        {/* Model Type Selector */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <span className="text-slate-400 px-2 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> 모델:
          </span>
          <button
            onClick={() => onModelChange('linear')}
            className={`px-3 py-1 rounded-lg transition ${
              selectedModel === 'linear'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            선형 (y = ax+b)
          </button>
          <button
            onClick={() => onModelChange('quadratic')}
            className={`px-3 py-1 rounded-lg transition ${
              selectedModel === 'quadratic'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            2차 함수 (y = ax²+bx+c)
          </button>
          <button
            onClick={() => onModelChange('exponential')}
            className={`px-3 py-1 rounded-lg transition ${
              selectedModel === 'exponential'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            지수 함수 (y = a·eᵇˣ)
          </button>
          <button
            onClick={() => onModelChange('logarithmic')}
            className={`px-3 py-1 rounded-lg transition ${
              selectedModel === 'logarithmic'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            로그 함수 (y = a·ln x+b)
          </button>
        </div>

        {/* Feature Toggles */}
        <div className="flex items-center space-x-2 text-xs">
          <label className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-slate-100 transition">
            <input
              type="checkbox"
              checked={showResiduals}
              onChange={(e) => setShowResiduals(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-slate-700 font-medium">잔차(오차) 오버레이</span>
          </label>

          <label className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-slate-100 transition">
            <input
              type="checkbox"
              checked={showFormula}
              onChange={(e) => setShowFormula(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-slate-700 font-medium">수식 라벨</span>
          </label>
        </div>
      </div>

      {/* Main Chart Graphic Area */}
      <div className="relative w-full h-[360px] sm:h-[400px]">
        {/* Floating Equation Banner */}
        {showFormula && regression && (
          <div className="absolute top-2 right-4 z-10 bg-slate-900/90 backdrop-blur-md text-white border border-slate-700 px-3.5 py-2 rounded-xl shadow-lg font-mono text-xs space-y-0.5 pointer-events-none">
            <div className="text-indigo-300 font-bold text-sm">
              {regression.equationText}
            </div>
            <div className="text-slate-300 text-[11px] flex items-center space-x-3">
              <span>R² = {regression.rSquared.toFixed(4)}</span>
              <span>r = {regression.r.toFixed(4)}</span>
            </div>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart margin={{ top: 20, right: 30, bottom: 25, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              type="number"
              dataKey="x"
              name={xName || 'X'}
              domain={xDomain}
              unit={xUnit ? ` ${xUnit}` : ''}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{
                value: `${xName || 'X'} ${xUnit ? `(${xUnit})` : ''}`,
                position: 'insideBottom',
                offset: -15,
                style: { fontSize: 12, fontWeight: 600, fill: '#334155' },
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={yName || 'Y'}
              unit={yUnit ? ` ${yUnit}` : ''}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{
                value: `${yName || 'Y'} ${yUnit ? `(${yUnit})` : ''}`,
                angle: -90,
                position: 'insideLeft',
                offset: 0,
                style: { fontSize: 12, fontWeight: 600, fill: '#334155' },
              }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
                      {data.label && <div className="font-bold text-indigo-300">{data.label}</div>}
                      <div>
                        {xName || 'X'}: <span className="font-mono">{data.x}</span> {xUnit}
                      </div>
                      <div>
                        {yName || 'Y'}: <span className="font-mono">{data.y !== undefined ? data.y : data.trendY}</span> {yUnit}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Render Active Data Points Scatter */}
            <Scatter
              name="관측 데이터"
              data={formattedActiveData}
              fill={chartColor}
              line={false}
              shape="circle"
            />

            {/* Render Disabled Outlier Data Points Scatter */}
            {formattedDisabledData.length > 0 && (
              <Scatter
                name="제외된 데이터(이상치)"
                data={formattedDisabledData}
                fill="#94a3b8"
                shape="cross"
              />
            )}

            {/* Render Computed Trendline Line */}
            {trendlinePoints.length > 0 && (
              <Line
                type="monotone"
                dataKey="trendY"
                data={trendlinePoints}
                name="추세선"
                stroke="#6366f1"
                strokeWidth={3}
                dot={false}
                activeDot={false}
              />
            )}

            {/* Active Prediction Reference Indicator */}
            {activePrediction && (
              <>
                <ReferenceDot
                  x={activePrediction.type === 'xToY' ? activePrediction.inputVal : activePrediction.predictedVal}
                  y={activePrediction.type === 'xToY' ? activePrediction.predictedVal : activePrediction.inputVal}
                  r={8}
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth={2}
                />
                <ReferenceLine
                  x={activePrediction.type === 'xToY' ? activePrediction.inputVal : activePrediction.predictedVal}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                />
                <ReferenceLine
                  y={activePrediction.type === 'xToY' ? activePrediction.predictedVal : activePrediction.inputVal}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                />
              </>
            )}

            {/* Residual Error Lines */}
            {showResiduals &&
              regression?.residuals.map((res, i) => (
                <ReferenceLine
                  key={`res_${i}`}
                  segment={[
                    { x: res.x, y: res.y },
                    { x: res.x, y: res.predictedY },
                  ]}
                  stroke="#ef4444"
                  strokeDasharray="2 2"
                  strokeWidth={2}
                />
              ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Footnote */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block"></span> 관측 데이터 점
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-1 bg-indigo-500 inline-block rounded"></span> 추세선 (회귀 모델)
          </span>
          {showResiduals && (
            <span className="flex items-center gap-1.5 text-rose-600 font-medium">
              <span className="w-4 h-0.5 bg-rose-500 inline-block border-t border-dashed border-rose-500"></span> 잔차 (관측값 - 예측값)
            </span>
          )}
          {activePrediction && (
            <span className="flex items-center gap-1.5 text-amber-600 font-medium">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> 예측 시뮬레이션 지점
            </span>
          )}
        </div>

        <div className="text-[11px] text-slate-400">
          * 최소제곱법(Least Squares Method)으로 계산된 최적 추세선입니다.
        </div>
      </div>
    </div>
  );
};

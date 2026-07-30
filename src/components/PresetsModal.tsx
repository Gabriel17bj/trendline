import React from 'react';
import { X, Sparkles, Check, BookOpen } from 'lucide-react';
import { SampleDataset } from '../types';
import { SAMPLE_DATASETS } from '../utils/sampleData';

interface PresetsModalProps {
  onSelectSample: (sample: SampleDataset) => void;
  onClose: () => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({ onSelectSample, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              고교 교과 탐구 예제 데이터셋 선택
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          물리학, 생명과학, 지구과학, 확률과 통계 교과서에 등장하는 실용 예제 데이터를 1클릭으로 불러옵니다.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1">
          {SAMPLE_DATASETS.map((dataset) => (
            <div
              key={dataset.id}
              onClick={() => {
                onSelectSample(dataset);
                onClose();
              }}
              className="p-4 bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 rounded-xl cursor-pointer transition flex flex-col justify-between space-y-2 group"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">
                    {dataset.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {dataset.points.length}개 데이터
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-900 mb-1">
                  {dataset.title}
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {dataset.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                <span>
                  <b>X:</b> {dataset.xName}
                </span>
                <span>
                  <b>Y:</b> {dataset.yName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

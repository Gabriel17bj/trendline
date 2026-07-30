import React from 'react';
import { User, School, BookOpen, Calendar, X, Check } from 'lucide-react';
import { StudentInfo } from '../types';

interface StudentInfoFormProps {
  studentInfo: StudentInfo;
  onChange: (updated: StudentInfo) => void;
  onClose?: () => void;
}

export const StudentInfoForm: React.FC<StudentInfoFormProps> = ({
  studentInfo,
  onChange,
  onClose,
}) => {
  const handleChange = (field: keyof StudentInfo, value: string) => {
    onChange({ ...studentInfo, [field]: value });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-xl w-full">
      <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2 text-white">
          <User className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-semibold">학생 및 탐구 활동 정보</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6 space-y-4">
        <p className="text-xs text-slate-500 leading-relaxed">
          리포트 출력 및 활동 결과물 저장을 위해 학생 정보와 탐구 주제를 입력해 주세요.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <School className="w-3.5 h-3.5 text-slate-400" /> 학교명
            </label>
            <input
              type="text"
              placeholder="예: 한국고등학교"
              value={studentInfo.schoolName}
              onChange={(e) => handleChange('schoolName', e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              학년 / 반
            </label>
            <input
              type="text"
              placeholder="예: 2학년 3반"
              value={studentInfo.gradeClass}
              onChange={(e) => handleChange('gradeClass', e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              학번
            </label>
            <input
              type="text"
              placeholder="예: 20315"
              value={studentInfo.studentId}
              onChange={(e) => handleChange('studentId', e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              이름
            </label>
            <input
              type="text"
              placeholder="예: 홍길동"
              value={studentInfo.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" /> 탐구 과목
            </label>
            <input
              type="text"
              placeholder="예: 물리학 I, 확률과 통계, 통합과학"
              value={studentInfo.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> 실험/탐구 일자
            </label>
            <input
              type="date"
              value={studentInfo.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            탐구 주제
          </label>
          <input
            type="text"
            placeholder="예: 용수철에 걸린 질량과 늘어난 길이 사이의 선형 회귀 분석"
            value={studentInfo.topic}
            onChange={(e) => handleChange('topic', e.target.value)}
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        {onClose && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
            >
              <Check className="w-4 h-4" />
              <span>확인 및 저장</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

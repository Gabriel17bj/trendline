import React from 'react';
import { ShieldCheck, X, Lock, Database, Server, Mail, UserCheck } from 'lucide-react';

interface PrivacyModalProps {
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between sticky top-0 z-10 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-400/30 text-indigo-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">개인정보처리방침</h2>
              <p className="text-xs text-slate-300">고교 데이터 추세선 분석기 (Trendline Lab) 보안 & 정보보호 안내</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-xs text-slate-700 leading-relaxed max-h-[70vh] overflow-y-auto">
          {/* Key Principle Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start space-x-3 text-emerald-900">
            <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-emerald-950 text-xs mb-1">100% 브라우저 로컬 저장 방식 (No Central DB)</h3>
              <p className="text-emerald-800 text-[11px]">
                본 서비스는 별도의 중앙 회원가입 및 외부 데이터베이스 서버를 사용하지 않습니다. 학생이 입력한 모든 탐구 데이터와 정보는 사용자의 개인 웹 브라우저 내에만 안전하게 보관됩니다.
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-1.5">
              <Database className="w-4 h-4 text-indigo-600" />
              <span>1. 수집하는 정보 항목 및 수집 방법</span>
            </div>
            <p>
              본 서비스는 로그인 과정 없이 이용 가능하며, 탐구활동 보고서 완성을 위해 다음 항목을 사용자의 웹 브라우저에 임시 저장합니다.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <li><strong>학생 인적사항 (선택):</strong> 학교명, 학년/반, 학번, 이름, 과목명</li>
              <li><strong>탐구 데이터:</strong> 탐구 주제, 변수명(X, Y), 측정 데이터 좌표값(X, Y)</li>
              <li><strong>소감 및 해석:</strong> 기울기/Y절편 해석, 결정계수 소감, 결론</li>
              <li><strong>Gemini API 키 (선택):</strong> 사용자가 직접 입력한 개인 Google Gemini API 키</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-1.5">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>2. 정보의 이용 목적</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-2">
              <li>고등학교 수학·과학 탐구활동 선형회귀 분석 및 추세선 시각화</li>
              <li>결정계수(R²), 기울기, 절편 등 통계 지표 자동 계산 및 예측 시뮬레이션</li>
              <li>탐구보고서 작성 및 PDF 문서 내보내기 기능 제공</li>
              <li>Google Gemini AI 기반 탐구 피드백 및 교사 멘토링 생성</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-1.5">
              <Server className="w-4 h-4 text-indigo-600" />
              <span>3. 제3자 제공 및 외부 API 연동</span>
            </div>
            <p>
              사용자의 동의 없이 제3자에게 개인정보를 제공하거나 수집하지 않습니다. 단, <strong>'AI 교사 피드백 받기'</strong> 버튼을 클릭할 경우 아래와 같이 필요 최솟값의 정보만 전송됩니다.
            </p>
            <div className="bg-indigo-50/60 border border-indigo-100 p-3 rounded-xl space-y-1">
              <p className="font-semibold text-indigo-950">Google Gemini API 전송 항목</p>
              <p className="text-slate-600 text-[11px]">
                탐구 주제, 변수명, 추세선 수식, 결정계수(R²), 학생 작성 소감 텍스트 (이름 및 학생 인적사항은 전송되지 않습니다.)
              </p>
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-1.5">
              <Lock className="w-4 h-4 text-indigo-600" />
              <span>4. 개인정보의 보유 및 파기</span>
            </div>
            <p>
              저장된 모든 정보는 사용자의 브라우저 내 LocalStorage에 보관되며, 사용자가 앱 상단의 <strong>'초기화'</strong> 버튼을 누르거나 브라우저의 '방문 기록/쿠키 삭제'를 수행하면 즉시 완전히 파기됩니다.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-1.5">
              <Mail className="w-4 h-4 text-indigo-600" />
              <span>5. 개인정보 보호책임자 및 문의</span>
            </div>
            <p>
              서비스 이용 중 문의사항이나 제안이 있으신 경우 아래 문의처로 연락해 주시기 바랍니다.
            </p>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl font-mono text-[11px] text-slate-800 space-y-0.5">
              <p><strong>개발자:</strong> Gabriel Math (Gabriel Byeongje Jeon)</p>
              <p><strong>이메일:</strong> gabriel@gabrielmath.kr</p>
              <p><strong>시행일자:</strong> 2026년 7월 30일</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};

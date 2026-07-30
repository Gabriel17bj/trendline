import React, { useRef, useState } from 'react';
import { X, FileText, Download, Printer, Image, Check, Loader2, Award, Calendar, School, User } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DataPoint, PredictionResult, ReflectionData, RegressionResult, StudentInfo } from '../types';
import { formatNum, getCorrelationDescription } from '../utils/regression';

interface ReportModalProps {
  studentInfo: StudentInfo;
  points: DataPoint[];
  regression: RegressionResult | null;
  reflection: ReflectionData;
  xName: string;
  xUnit: string;
  yName: string;
  yUnit: string;
  activePrediction?: PredictionResult | null;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  studentInfo,
  points,
  regression,
  reflection,
  xName,
  xUnit,
  yName,
  yUnit,
  activePrediction,
  onClose,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);
  const [downloadingImage, setDownloadingImage] = useState<boolean>(false);

  const activePoints = points.filter((p) => p.enabled !== false);
  const correlationInfo = regression ? getCorrelationDescription(regression.r) : null;

  // Export to PDF
  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setDownloadingPdf(true);

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const fileName = `${studentInfo.schoolName || '고등학교'}_${studentInfo.name || '학생'}_추세선탐구_리포트.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('PDF Export Error:', err);
      alert('PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Export to Image (PNG)
  const handleExportImage = async () => {
    if (!reportRef.current) return;
    setDownloadingImage(true);

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = `${studentInfo.schoolName || '고등학교'}_${studentInfo.name || '학생'}_추세선탐구_리포트.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Image Export Error:', err);
      alert('이미지 생성 중 오류가 발생했습니다.');
    } finally {
      setDownloadingImage(false);
    }
  };

  // Browser Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold">데이터 분석 리포트 미리보기 & PDF 저장</h3>
          </div>

          <div className="flex items-center space-x-2">
            {/* Export PNG */}
            <button
              onClick={handleExportImage}
              disabled={downloadingImage}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              {downloadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Image className="w-3.5 h-3.5 text-sky-400" />}
              <span>이미지(PNG) 저장</span>
            </button>

            {/* Export PDF */}
            <button
              onClick={handleExportPDF}
              disabled={downloadingPdf}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-sm transition"
            >
              {downloadingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>PDF 내보내기</span>
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="인쇄"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Scroll Area */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100 flex-1">
          {/* Printable Sheet Container */}
          <div
            ref={reportRef}
            className="bg-white p-8 rounded-none sm:rounded-xl border border-slate-200 shadow-md text-slate-900 space-y-6 max-w-3xl mx-auto print:shadow-none print:border-none print:p-0"
            style={{ minHeight: '1000px' }}
          >
            {/* Report Header Title */}
            <div className="border-b-2 border-indigo-900 pb-4 text-center space-y-1">
              <span className="text-[11px] font-bold text-indigo-700 tracking-widest uppercase">
                고등학교 수학 · 과학 탐구 활동 보고서
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {studentInfo.topic || '데이터 추세선 회귀 분석 탐구 보고서'}
              </h2>
            </div>

            {/* Student Info Bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">학교 / 학년반</span>
                <span className="font-bold text-slate-800">
                  {studentInfo.schoolName || '고등학교'} {studentInfo.gradeClass || ''}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">학번 / 이름</span>
                <span className="font-bold text-slate-800">
                  {studentInfo.studentId ? `${studentInfo.studentId} ` : ''}
                  {studentInfo.name || '학생'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">탐구 과목</span>
                <span className="font-bold text-slate-800">{studentInfo.subject || '수학/과학'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">실험 일자</span>
                <span className="font-bold text-slate-800">
                  {studentInfo.date || new Date().toISOString().split('T')[0]}
                </span>
              </div>
            </div>

            {/* Section 1: Mathematical Regression Model */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-indigo-900 border-l-4 border-indigo-600 pl-2">
                1. 회귀 모델 및 수학적 추세선 수식
              </h4>
              {regression ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium">추세선 방정식:</span>
                    <div className="text-lg font-mono font-bold text-indigo-900 my-1">
                      {regression.equationText}
                    </div>
                    <div className="text-xs text-slate-600 space-y-0.5 font-mono">
                      <div>
                        기울기 (a) = {formatNum(regression.coefficients.a)} ({yUnit}/{xUnit})
                      </div>
                      <div>
                        Y절편 (b) = {formatNum(regression.coefficients.b)} ({yUnit})
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex justify-between border-b border-indigo-100 pb-1">
                      <span>결정계수 (R²):</span>
                      <span className="font-mono font-bold text-indigo-900">
                        {regression.rSquared.toFixed(4)} ({(regression.rSquared * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-indigo-100 pb-1">
                      <span>상관계수 (r):</span>
                      <span className="font-mono font-bold text-indigo-900">
                        {regression.r.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>평균제곱근오차 (RMSE):</span>
                      <span className="font-mono font-bold text-slate-800">
                        {formatNum(regression.rmse, 3)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">데이터가 존재하지 않습니다.</p>
              )}
            </div>

            {/* Section 2: Data Table Summary */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-indigo-900 border-l-4 border-indigo-600 pl-2">
                2. 관측 데이터 요약 ({activePoints.length}개 표)
              </h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 font-semibold text-slate-800 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 text-center">#</th>
                      <th className="py-2 px-3">
                        {xName || 'X'} {xUnit ? `(${xUnit})` : ''}
                      </th>
                      <th className="py-2 px-3">
                        {yName || 'Y'} {yUnit ? `(${yUnit})` : ''}
                      </th>
                      <th className="py-2 px-3">추세선 예측값 (Ŷ)</th>
                      <th className="py-2 px-3">잔차 (Y - Ŷ)</th>
                      <th className="py-2 px-3">비고</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {regression?.residuals.map((res, i) => (
                      <tr key={`rep_row_${i}`}>
                        <td className="py-1.5 px-3 text-center font-mono text-slate-400">{i + 1}</td>
                        <td className="py-1.5 px-3 font-mono font-semibold">{res.x}</td>
                        <td className="py-1.5 px-3 font-mono font-semibold">{res.y}</td>
                        <td className="py-1.5 px-3 font-mono text-indigo-700">
                          {formatNum(res.predictedY, 2)}
                        </td>
                        <td className="py-1.5 px-3 font-mono text-slate-600">
                          {formatNum(res.residual, 2)}
                        </td>
                        <td className="py-1.5 px-3 text-slate-500">{activePoints[i]?.label || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3: Prediction Simulation (if active) */}
            {activePrediction && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-indigo-900 border-l-4 border-indigo-600 pl-2">
                  3. 추세선 예측 시뮬레이션 결과
                </h4>
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-amber-950">
                    <span>
                      {activePrediction.type === 'xToY'
                        ? `입력 ${xName || 'X'}: ${activePrediction.inputVal} ${xUnit}`
                        : `목표 ${yName || 'Y'}: ${activePrediction.inputVal} ${yUnit}`}
                    </span>
                    <span className="font-mono text-sm text-indigo-900">
                      예측 결과: {formatNum(activePrediction.predictedVal, 3)}
                    </span>
                  </div>
                  <p className="text-slate-600">{activePrediction.notes}</p>
                </div>
              </div>
            )}

            {/* Section 4: Student Reflections & Discussions */}
            <div className="space-y-4 pt-2">
              <h4 className="text-sm font-bold text-indigo-900 border-l-4 border-indigo-600 pl-2">
                4. 추세선 분석 및 탐구 고찰 (학생 작성)
              </h4>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <h5 className="font-bold text-slate-800 mb-1">
                    (1) 기울기($a$)의 물리적·실험적 의미
                  </h5>
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                    {reflection.slopeMeaning || '미작성'}
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <h5 className="font-bold text-slate-800 mb-1">
                    (2) Y절편($b$)의 실제 의미 및 초기 조건 해석
                  </h5>
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                    {reflection.interceptMeaning || '미작성'}
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <h5 className="font-bold text-slate-800 mb-1">
                    (3) 결정계수($R^2$) 및 추세선 신뢰도 평가
                  </h5>
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                    {reflection.rSquaredInterpretation || '미작성'}
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <h5 className="font-bold text-slate-800 mb-1">(4) 탐구 종합 결론 및 소감</h5>
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                    {reflection.conclusion || '미작성'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer stamp */}
            <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
              <span>고교 데이터 추세선 분석 리포트 시스템</span>
              <span>작성일자: {studentInfo.date || new Date().toISOString().split('T')[0]}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Table, Upload, Plus, Trash2, Edit3, Check, FileSpreadsheet, Eye, EyeOff, Sparkles, Clipboard } from 'lucide-react';
import * as XLSX from 'xlsx';
import { DataPoint, SampleDataset } from '../types';
import { SAMPLE_DATASETS } from '../utils/sampleData';

interface DataInputSectionProps {
  points: DataPoint[];
  xName: string;
  xUnit: string;
  yName: string;
  yUnit: string;
  onPointsChange: (points: DataPoint[]) => void;
  onXNameChange: (val: string) => void;
  onXUnitChange: (val: string) => void;
  onYNameChange: (val: string) => void;
  onYUnitChange: (val: string) => void;
  onLoadSample: (sample: SampleDataset) => void;
}

export const DataInputSection: React.FC<DataInputSectionProps> = ({
  points,
  xName,
  xUnit,
  yName,
  yUnit,
  onPointsChange,
  onXNameChange,
  onXUnitChange,
  onYNameChange,
  onYUnitChange,
  onLoadSample,
}) => {
  const [activeTab, setActiveTab] = useState<'table' | 'upload' | 'paste' | 'samples'>('table');
  const [pasteText, setPasteText] = useState<string>('');
  const [pasteError, setPasteError] = useState<string | null>(null);

  // File Upload State
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [parsedColumns, setParsedColumns] = useState<string[]>([]);
  const [excelDataRows, setExcelDataRows] = useState<any[]>([]);
  const [selectedXCol, setSelectedXCol] = useState<string>('');
  const [selectedYCol, setSelectedYCol] = useState<string>('');

  // Add Point
  const handleAddRow = () => {
    const newPoint: DataPoint = {
      id: 'pt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      x: points.length > 0 ? points[points.length - 1].x + 1 : 1,
      y: points.length > 0 ? points[points.length - 1].y + 2 : 2,
      enabled: true,
    };
    onPointsChange([...points, newPoint]);
  };

  // Delete Point
  const handleDeleteRow = (id: string) => {
    onPointsChange(points.filter((p) => p.id !== id));
  };

  // Toggle Enable/Disable
  const handleTogglePoint = (id: string) => {
    onPointsChange(
      points.map((p) => (p.id === id ? { ...p, enabled: p.enabled === false ? true : false } : p))
    );
  };

  // Update Point Value
  const handleCellChange = (id: string, field: 'x' | 'y' | 'label', val: string) => {
    onPointsChange(
      points.map((p) => {
        if (p.id !== id) return p;
        if (field === 'label') {
          return { ...p, label: val };
        }
        const numVal = parseFloat(val);
        return { ...p, [field]: isNaN(numVal) ? 0 : numVal };
      })
    );
  };

  // Parse Copy-Pasted Tabular Data
  const handleParsePaste = () => {
    setPasteError(null);
    if (!pasteText.trim()) {
      setPasteError('붙여넣을 데이터 텍스트를 입력해주세요.');
      return;
    }

    const lines = pasteText.trim().split('\n');
    const newPoints: DataPoint[] = [];

    let startIndex = 0;
    // Check if first row contains column titles
    const firstLineCols = lines[0].split(/[\t,]+/);
    if (isNaN(parseFloat(firstLineCols[0].trim())) && isNaN(parseFloat(firstLineCols[1]?.trim() || ''))) {
      startIndex = 1;
      if (firstLineCols[0]) onXNameChange(firstLineCols[0].trim());
      if (firstLineCols[1]) onYNameChange(firstLineCols[1].trim());
    }

    for (let i = startIndex; i < lines.length; i++) {
      const parts = lines[i].split(/[\t,]+/);
      if (parts.length >= 2) {
        const xVal = parseFloat(parts[0].trim());
        const yVal = parseFloat(parts[1].trim());
        const labelVal = parts[2]?.trim() || `데이터 ${i + 1}`;
        if (!isNaN(xVal) && !isNaN(yVal)) {
          newPoints.push({
            id: `pt_paste_${i}_${Date.now()}`,
            x: xVal,
            y: yVal,
            label: labelVal,
            enabled: true,
          });
        }
      }
    }

    if (newPoints.length === 0) {
      setPasteError('올바른 숫자 데이터가 발견되지 않았습니다. (예: 10 [Tab] 25)');
    } else {
      onPointsChange(newPoints);
      setActiveTab('table');
      setPasteText('');
    }
  };

  // File Upload Handler (Excel/CSV)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });
        if (!jsonData || jsonData.length < 2) {
          setUploadError('엑셀 데이터에 최소 2행 이상의 항목이 필요합니다.');
          return;
        }

        // Header row
        const headers = jsonData[0].map((h: any, idx: number) => (h ? String(h) : `열 ${idx + 1}`));
        const rows = jsonData.slice(1);

        setParsedColumns(headers);
        setExcelDataRows(rows);

        if (headers.length >= 2) {
          setSelectedXCol(headers[0]);
          setSelectedYCol(headers[1]);
        }
      } catch (err: any) {
        setUploadError('파일을 읽는 중 오류가 발생했습니다: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Import Selected Columns from Excel
  const handleApplyExcelMapping = () => {
    if (!selectedXCol || !selectedYCol) return;

    const xIdx = parsedColumns.indexOf(selectedXCol);
    const yIdx = parsedColumns.indexOf(selectedYCol);

    if (xIdx === -1 || yIdx === -1) return;

    const newPoints: DataPoint[] = [];
    excelDataRows.forEach((row, idx) => {
      const xVal = parseFloat(row[xIdx]);
      const yVal = parseFloat(row[yIdx]);
      if (!isNaN(xVal) && !isNaN(yVal)) {
        newPoints.push({
          id: `pt_excel_${idx}_${Date.now()}`,
          x: xVal,
          y: yVal,
          label: row[2] ? String(row[2]) : `행 ${idx + 1}`,
          enabled: true,
        });
      }
    });

    if (newPoints.length > 0) {
      onXNameChange(selectedXCol);
      onYNameChange(selectedYCol);
      onPointsChange(newPoints);
      setActiveTab('table');
      setParsedColumns([]);
      setExcelDataRows([]);
    } else {
      setUploadError('선택한 열에서 변환 가능한 유효한 숫자 데이터를 찾을 수 없습니다.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header Tabs */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-1 bg-slate-200/80 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'table'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-indigo-600" />
            <span>직접 표 입력</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'upload'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>엑셀/CSV 업로드</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'paste'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clipboard className="w-3.5 h-3.5 text-sky-600" />
            <span>복사-붙여넣기</span>
          </button>

          <button
            onClick={() => setActiveTab('samples')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'samples'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>탐구 예제</span>
          </button>
        </div>

        <div className="text-xs text-slate-500">
          총 <span className="font-bold text-indigo-600">{points.filter((p) => p.enabled !== false).length}개</span> 데이터 포인트
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {/* Variable Customization Controls */}
        <div className="mb-4 bg-indigo-50/60 border border-indigo-100 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-indigo-900 mb-1">
              독립변수 (X축) 이름 및 단위
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={xName}
                onChange={(e) => onXNameChange(e.target.value)}
                placeholder="변수명 (예: 추의 질량)"
                className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={xUnit}
                onChange={(e) => onXUnitChange(e.target.value)}
                placeholder="단위 (예: g)"
                className="w-20 text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-indigo-900 mb-1">
              종속변수 (Y축) 이름 및 단위
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={yName}
                onChange={(e) => onYNameChange(e.target.value)}
                placeholder="변수명 (예: 늘어난 길이)"
                className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={yUnit}
                onChange={(e) => onYUnitChange(e.target.value)}
                placeholder="단위 (예: cm)"
                className="w-20 text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Tab 1: Interactive Table */}
        {activeTab === 'table' && (
          <div className="space-y-3">
            <div className="overflow-x-auto max-h-72 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[11px] sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3 text-center w-12">사용</th>
                    <th className="py-2 px-3 text-center w-12">#</th>
                    <th className="py-2 px-3 font-semibold">
                      {xName || 'X'} {xUnit ? `(${xUnit})` : ''}
                    </th>
                    <th className="py-2 px-3 font-semibold">
                      {yName || 'Y'} {yUnit ? `(${yUnit})` : ''}
                    </th>
                    <th className="py-2 px-3 font-semibold">항목/비고 (선택)</th>
                    <th className="py-2 px-3 text-center w-12">삭제</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {points.map((pt, idx) => {
                    const isDisabled = pt.enabled === false;
                    return (
                      <tr
                        key={pt.id}
                        className={`hover:bg-slate-50 transition ${
                          isDisabled ? 'bg-slate-100/70 text-slate-400 line-through' : ''
                        }`}
                      >
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => handleTogglePoint(pt.id)}
                            className={`p-1 rounded transition ${
                              isDisabled
                                ? 'text-slate-400 hover:text-slate-600'
                                : 'text-indigo-600 hover:text-indigo-800'
                            }`}
                            title={isDisabled ? '분석에 포함하기' : '이상치 제외 (제외 시 회귀선에서 제외됨)'}
                          >
                            {isDisabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="py-2 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-1.5 px-3">
                          <input
                            type="number"
                            step="any"
                            value={pt.x}
                            onChange={(e) => handleCellChange(pt.id, 'x', e.target.value)}
                            disabled={isDisabled}
                            className="w-full px-2 py-1 border border-slate-200 rounded font-mono text-xs focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                          />
                        </td>
                        <td className="py-1.5 px-3">
                          <input
                            type="number"
                            step="any"
                            value={pt.y}
                            onChange={(e) => handleCellChange(pt.id, 'y', e.target.value)}
                            disabled={isDisabled}
                            className="w-full px-2 py-1 border border-slate-200 rounded font-mono text-xs focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                          />
                        </td>
                        <td className="py-1.5 px-3">
                          <input
                            type="text"
                            placeholder="예: 1차 실험"
                            value={pt.label || ''}
                            onChange={(e) => handleCellChange(pt.id, 'label', e.target.value)}
                            disabled={isDisabled}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => handleDeleteRow(pt.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                            title="행 삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handleAddRow}
                className="flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-2 rounded-xl transition"
              >
                <Plus className="w-4 h-4" />
                <span>데이터 행 추가</span>
              </button>
              <p className="text-[11px] text-slate-400">
                * 눈 아이콘을 클릭하면 특이점(이상치)을 회귀 계산에서 제외/포함할 수 있습니다.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: File Upload (Excel/CSV) */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 transition cursor-pointer relative">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <FileSpreadsheet className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-800 mb-1">
                엑셀 파일(.xlsx, .xls) 또는 CSV 드래그 & 드롭
              </h4>
              <p className="text-[11px] text-slate-500">
                여기를 클릭하여 탐구 실험 데이터 파일 선택
              </p>
            </div>

            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {uploadError}
              </div>
            )}

            {parsedColumns.length > 0 && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                <h5 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" /> 파일 해석 성공 ({excelDataRows.length}개 행 감지됨)
                </h5>
                <p className="text-xs text-emerald-800">
                  X변수(독립변수)와 Y변수(종속변수)에 해당하는 열을 선택해 주세요.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      X축 (독립변수) 열 선택
                    </label>
                    <select
                      value={selectedXCol}
                      onChange={(e) => setSelectedXCol(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                    >
                      {parsedColumns.map((col) => (
                        <option key={`x_${col}`} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Y축 (종속변수) 열 선택
                    </label>
                    <select
                      value={selectedYCol}
                      onChange={(e) => setSelectedYCol(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                    >
                      {parsedColumns.map((col) => (
                        <option key={`y_${col}`} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleApplyExcelMapping}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 rounded-xl transition"
                >
                  데이터 표에 적용하기
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Copy-Paste */}
        {activeTab === 'paste' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              구글 스프레드시트나 엑셀에서 복사(Ctrl+C)한 2열짜리 데이터를 아래 상자에 붙여넣기(Ctrl+V)하세요.
            </p>
            <textarea
              rows={5}
              placeholder="10	25&#10;20	48&#10;30	71&#10;40	95"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
            {pasteError && (
              <p className="text-xs text-rose-600 font-medium">{pasteError}</p>
            )}
            <button
              onClick={handleParsePaste}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
            >
              붙여넣은 데이터 적용
            </button>
          </div>
        )}

        {/* Tab 4: Sample Datasets */}
        {activeTab === 'samples' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SAMPLE_DATASETS.map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  onLoadSample(s);
                  setActiveTab('table');
                }}
                className="p-3.5 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 rounded-xl cursor-pointer transition group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">
                    {s.category}
                  </span>
                  <span className="text-[11px] text-slate-400 group-hover:text-indigo-600">
                    {s.points.length}개 데이터
                  </span>
                </div>
                <h5 className="text-xs font-bold text-slate-800 group-hover:text-indigo-900 mb-1">
                  {s.title}
                </h5>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
